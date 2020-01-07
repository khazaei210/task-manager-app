const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error('Invalid email address')
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        validate(value){
            if (value.length < 6) throw new Error('Password must be geater than 5 character')
            if (value.includes('password')) throw new Error('Password can not contain "password"')
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if (value < 0) throw new Error('Age can not be a negetive value')
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps: true
})
userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email})
    if (!user)  throw new Error('Unable to login')
    const isMatched = await bcrypt.compare(password, user.password)
    if (!isMatched) throw new Error('Unable to login')
    return user
}
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)
    user.tokens.push({token})
    await user.save()
    return token
}
userSchema.pre('save', async function(next){
    const user = this
    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
       
    }
    next()
})
//remove all user`s tasks
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()  
})
const User = mongoose.model('User',userSchema)
module.exports = User