require("dotenv").config();
const colors = require('colors');
const mongoose = require('mongoose')
const pass = process.env.dbPass;

mongoose.connect(`mongodb+srv://PocketChat:${pass}@cluster0.qi4oj.mongodb.net/userCollection?retryWrites=true&w=majority`, { useNewUrlParser : true, useUnifiedTopology : true})
.then((res)=>console.log('> Connected...'.bgCyan))
.catch(err=>console.log(`> Error while connecting to mongoDB : ${err.message}`.underline.red ))

module.exports.mongoose;
