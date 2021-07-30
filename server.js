//config the server
const express = require('express');
const app = express();
const session = require("express-session")
const reqflash = require('req-flash')
const follow = require("/media/yashwant/Mystroage/Chat_App_Final/models/FollowUnfollow.js");
const massage = require("/media/yashwant/Mystroage/Chat_App_Final/models/Massage.js");
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

app.use(require('./server/router/route'))



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
                const element = userList[data.reciver];
                //for saving massage
                const time = new Date();
                let ctime = time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
                let date = time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear();
                let Sdate = time.getDate()+time.getMonth()+time.getFullYear();
                let Stime = time.getHours()+time.getMinutes()+time.getSeconds();
                console.log(Stime," ",Sdate);
                if(element != null ){
                    
                    const metaData = new massage({
                        Sender : data.name,
                        Reciver : data.reciver,
                        Massage : data.msg,
                        Data : date,
                        Stime: Stime,
                        Sdate: Sdate,
                        Time : ctime
                    })
                    
                    metaData.save().then(()=>{
                        // console.log("massage saved");
                        data.position = "left"
                        socket.broadcast.to(element).emit("Massage",data)
                    })
                    break;

                }
                else{
                    const metaData = new massage({
                        Sender : data.name,
                        Reciver : data.reciver,
                        Massage : data.msg,
                        Date : date,
                        Time : ctime
                    })
                    metaData.save()
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
        massage.find({Sender : {"$in":[data.reciver,data.sender]},Reciver:{"$in":[data.reciver,data.sender]}}).sort({Stime : 1,Sdate : -1}).then((Rdata)=>{
                // console.log(Rdata);
                socket.emit("takeMsg",Rdata)
        })
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
