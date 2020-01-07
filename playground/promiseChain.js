require('../src/db/mongoose')
const Task = require('../src/module/task')
// Task.findByIdAndDelete('5e11779dcc4fe90e9831e80f').then(task=>{
//     console.log(task)
//     return Task.countDocuments({completed: false})
// }).then(count=>{
//     console.log(count)
// }).catch(e=>{
//     console.log(e)
// })

const deleteTaskAndCount = async (id)=>{
    const del = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({completed: false})
    return count
}

deleteTaskAndCount('5e119c7816521b1814c1d622').then(count =>{
    console.log(count)
}).catch(e=>{
    console.log(e)
})