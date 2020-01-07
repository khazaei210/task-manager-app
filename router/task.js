const express = require('express')
const Task = require('../src/module/task')
const auth = require('../middleware/auth')
const router = new express.Router()

//------------------------
router.post('/tasks', auth, async (req, res)=>{
    const gettask = {
        ...req.body,
        owner: req.user._id
    }
    const task = new Task(gettask)
    try{
        
        await task.save()
        res.status(201).send(task)

    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/tasks', auth, async (req,res)=>{
    const match = {}
    const sort = {}
    if (req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }
    if (req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    try{
        //const tasks = await Task.find({owner: req.user._id})
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        //if (!tasks) return res.status(404).send()
        //console.log(req.user.tasks)
        if (!req.user.tasks) res.status(404).send()
        res.send(req.user.tasks)

    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) return res.status(404).send()
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
    
})

router.patch('/tasks/:id', auth, async (req, res)=>{
        const _id = req.params.id
        const updates = Object.keys(req.body)
        const validUpdate = ['description', 'completed']
        const isValid = updates.every(update=> validUpdate.includes(update))
        if (!isValid) return res.status(400).send({error: 'invalid Update!'})
    try{ 
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) return res.status(404).send()
        updates.forEach(el=> task[el] = req.body[el])
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req,res)=>{
    try{
        const _id = req.params.id
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if (!task) return res.status(404).send()
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})
module.exports = router