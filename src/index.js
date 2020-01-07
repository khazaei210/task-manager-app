const express = require('express')
require('./db/mongoose')
const taskRouter = require('../router/task')
const userRouter = require('../router/user')
const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(taskRouter)
app.use(userRouter)
app.listen(port, ()=>{
    console.log('server is runing')
})