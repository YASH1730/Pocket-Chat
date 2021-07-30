const mongoose = require('mongoose')    
const feed = mongoose.Schema({
    OTP : String,
    ExpireIn : String
})
module.exports =  mongoose.model( 'OTP' , feed)
