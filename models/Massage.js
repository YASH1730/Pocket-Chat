const mongoose = require('mongoose')    
const records = mongoose.Schema({
    Sender : String,
    Reciver : String,
    Massage : String,
    Data : String,
    Time : String,
    Stime : String,
    Sdate : String
})
module.exports =  mongoose.model( 'Massage-Records' , records)
