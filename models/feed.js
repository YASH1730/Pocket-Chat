const mongoose = require('mongoose')    
const feed = mongoose.Schema({
    UserName : String,
    Discription : String,
    Post : String,
    Public_id : String,
    Data : String,
    Time : String
})
module.exports =  mongoose.model( 'Users_Feed' , feed)