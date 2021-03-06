const express = require('express')
const {sendWelcome, sayBy} = require('../email/account')
const User = require('../src/module/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()

router.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})

    }catch(e){
        res.status(400).send()
    }

})
router.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=> token.token !== req.token)
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()

    }catch(e){
        res.status(500).send()
    }
})
router.post('/users',async (req, res)=>{
    const user = new User(req.body)
    try{
        
        await user.save()
        sendWelcome(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})

    }catch(e){
        res.status(400).send(e)
    }
})
router.get('/users/me', auth, async (req,res)=>{
    res.send(req.user)
})



router.patch('/users/me', auth, async (req, res)=>{
        const updates = Object.keys(req.body)
        const validUpdate = ['name', 'email', 'password', 'age']
        const isValid = updates.every(update=> validUpdate.includes(update))
        if (!isValid) return res.status(400).send({error: 'invalid Update!'})
    try{ 
        updates.forEach(el=> req.user[el] = req.body[el])
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req,res)=>{
    try{
        await req.user.remove()
        sayBy(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if (!file.originalname.match(/\.(jpg|jepg|png)$/)) return cb(new Error('File is not image'))
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:200, height:200}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()

},(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send() 
})

router.get('/users/:id/avatar', async (req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        if (!(user || user.avatar)){
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }

})
module.exports = router