//config the server
const express = require('express');
const app = express();
const session = require("express-session")
const reqflash = require('req-flash')
const follow = require("./models/FollowUnfollow");
const massage = require("./models/Massage");
const PORT = process.env.PORT || 80;


// const controller = require('./controller/controller')


//set up session

app.use(session({secret : "asdlajlksdfhalsdfhalfj"}))
app.use(reqflash())


//database config
const mongoose = require('mongoose')
const  mongo = require('./models/Mongo_config');
const { render } = require('pug');
const { Socket } = require('socket.io');
let url = "";

//set up the view engine 
app.set('view engine','pug')
app.set('views','views')



//set public file
app.use("/public", express.static("./public/"));
app.use(express.urlencoded());

app.use(fetchURL = (req,res,next) =>{
    // console.log(req.url)
    if (req.url == "/logout")
    {
    url = req.url;
    }
    next();
})

//setting up router requests

app.use(require('./server/router/Route'))



//setting up the server at listening
const server  = app.listen(PORT,()=>{
    console.log('sever listing at http://localhost:80')
})

//setting up Socket.io

let userList = []

const io = require('socket.io')(server)


io.on('connection',(socket) =>{
    console.log("Online",socket.id)


//userlist append 

    socket.on('UserName',(name)=>{

        // console.log(performance.now());
        let time = new Date();
        let ctime = time.getHours();
        var greet = "";

        if(ctime < 12)
            greet = "Good Morning"
        else if(ctime >= 12 &&  ctime <= 16)
            greet = "Good Afternoon"
        else if(ctime >= 16 &&  ctime <= 23)
            greet = "Good Evening"

        let data = "Bot :- "+greet+" "+name+",\n"+"select your buddy and Start the Chating."
    
        socket.emit("Greeting",data);
        socket.broadcast.emit("status",name+" is online")
        userList[name] = socket.id;
        console.log(userList)

    })

// recive massage
    socket.on('recive',(data)=>{
        // console.log("reciver : ",data.reciver);
        if(data.reciver != "")
        {
        for (const key in userList) {
            if (Object.hasOwnProperty.call(userList, key)) {
                const reciver = userList[data.reciver];
                const sender = userList[data.name];

                //for saving massage
                const time = new Date();
                let ctime = time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
                let date = time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear();
                if(reciver != null ){
                    
                    const metaData = new massage({
                        Sender : data.name,
                        Reciver : data.reciver,
                        Massage : data.msg,
                        Data : date,
                        Time : ctime,
                        Status : "Sent at"

                    })
                    metaData.save().then(()=>{
                        // console.log("massage saved");
                        data.position = "left"
                        socket.emit("Seen","Sent at ")
                        socket.broadcast.to(reciver).emit("Massage",data)
                    })
                    massage
                    break;

                }
                else{
                    const metaData = new massage({
                        Sender : data.name,
                        Reciver : data.reciver,
                        Massage : data.msg,
                        Date : date,
                        Time : ctime,
                        Status : "Sent at "
                    })
                    metaData.save()
                    socket.emit("Seen","Sent at ")
                    break;
                }
            }
        }
    }
    else{
        socket.emit("botMsg","Bot :- Please select the user, whom you wanna chat with !!!")
    }
    })

// print the last massages

socket.on("printMsg",(data)=>{
        let sort = { createdOn : 1}
        massage.find({Sender : {"$in":[data.reciver,data.sender]},Reciver:{"$in":[data.reciver,data.sender]}}).sort(sort).then((Rdata)=>{
                for (let index = 0; index < Rdata.length; index++) {
                    const element = Rdata[index];
                    
                    if(element != "Seen" && Rdata[index].Sender == data.reciver){
                        Rdata[index].Status = "Seen at "
                        Rdata[index].save()
                    }
                }
                // console.log(userList[data.reciver])
                socket.broadcast.to(userList[data.reciver]).emit("reload",data);
                socket.emit("takeMsg",Rdata)
        })
    })

//confirm
socket.on("confirm",(data)=>{
    let sort = { createdOn : 1}
    massage.find({Sender : {"$in":[data.reciver,data.sender]},Reciver:{"$in":[data.reciver,data.sender]}}).sort(sort).then((Rdata)=>{
        for (let index = 0; index < Rdata.length; index++) {
                const element = Rdata[index];
            
                    console.log(Rdata);
                    if(element != "Seen" && Rdata[index].Sender == data.sender){
                        Rdata[index].Status = "Seen at "
                        Rdata[index].save()
                    }
                }
                // console.log(userList[data.reciver])
            })
     socket.broadcast.to(userList[data.sender]).emit("reload2",data);
})

//status while typing
    socket.on("typing",(data)=>{
        // console.log(data.msg,data.reciver)
        for (const key in userList) {
            if (Object.hasOwnProperty.call(userList, key)) {       
                const element = userList[data.reciver];
                // console.log(element)
                socket.broadcast.to(element).emit("isType",data)
            }
        }
    })

// disconnect user

socket.on("disconnect",(data)=>{

        for (const key in userList) {
            if (Object.hasOwnProperty.call(userList, key)) {
                if(userList[key] == socket.id)
                {
                    // console.log("key :",key);
                    
                    follow.find({Leader : key}).then((ldata)=>{
                        
                        // console.log(ldata)

                        for (let i = 0; i < ldata.length; i++) {
                            const element = ldata[i];
                            // console.log(userList[element.Follower],url);
                            delete userList[key];
                            // console.log("url : ",url)
                            if(url != ""){
                                socket.broadcast.to(userList[element.Follower]).emit("leave",element.Leader+" is ofline");
                                url = "";
                            }                            
                        }
                    })
                    
                    
                }
                
            }
        }
            
    })
               
})