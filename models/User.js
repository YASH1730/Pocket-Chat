const mongoose = require('mongoose')    
const user = mongoose.Schema({
    UserName : String,
    Password : String,
    Email : String,
    jwtToken : String,
    Profile :String,
    Gender: String,
    DOB: String,
    Age: Number,
    Bio:String,
    Follower: Number,
    Following:Number,
    Posts:Number
})
module.exports =  mongoose.model( 'user_info' , user)
