const mongoose = require('mongoose')    
const user = mongoose.Schema({
    Follower : String,
    Leader : String,
    Date : String,
    Time :String
})
module.exports =  mongoose.model( 'followerCount' , user)