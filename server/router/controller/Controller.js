//module
// const validator = require('express-validator')
require("dotenv").config();
const user = require("../../../models/User.js");
const feed = require("../../../models/Feed.js");
const follow = require("../../../models/FollowUnfollow.js");
const massage = require("../../../models/Massage.js");
const OTP = require("../../../models/Otp.js");
const bcrypt = require("bcrypt");
// const JWT = require("jsonwebtoken");
const router = require("express").Router();
const cook = require("cookie-parser");
// const { json, response } = require("express");
const fileupload = require("express-fileupload");
const cloud = require("cloudinary").v2;
const nodemailer = require("nodemailer");
// const { body, validationResult } = require("express-validator");
const {google} = require("googleapis")


const client_id = process.env.client_id
const cleint_secret = process.env.cleint_secret
const redirect_URI = process.env.redirect_URI
const refresh = process.env.refresh

const oAuth2 = new google.auth.OAuth2(client_id,cleint_secret,redirect_URI)
oAuth2.setCredentials({refresh_token: refresh})

const accessT = oAuth2.getAccessToken()
//set mail
var mail = nodemailer.createTransport({
 
  service: 'gmail',
  type: "SMTP",
  name :"gmail.com",
  host: "smtp.gmail.com",
  secure: true,
  auth:{
    type: "OAuth2",
    user : "pocketchat30@gmail.com",
    clientId : client_id,
    clientSecret : cleint_secret,
    refreshToken : refresh,
    accessToken : accessT
  }
});

// // Function make

// const { count } = require("/media/yashwant/Mystroage/Chat_App_Final/models/user.js");

// const jwtKey = process.env.jwtKey;

//cookie
router.use(cook());

//uploading file
router.use(
  fileupload({
    useTempFiles: true,
  })
);

//config cloud code
cloud.config({     
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  secure: true,
});

//function to parse the cookie into list

function parseCookies(request) {
  var list = {},
    rc = request.headers.cookie;
  rc &&
    rc.split(";").forEach(function (cookie) {
      var parts = cookie.split("=");
      list[parts.shift().trim()] = decodeURI(parts.join("="));
    });

  return list;
}

//----------------------------------HOME STARTS-------------------------------
//home

exports.main = (req, res) => {
  var list = parseCookies(req);
  var n = list["name"];
  if (n != undefined) {
    res.render("home.pug", {
      title: "Home",
      show: "true",
      name: `${n}`,
      profile: "ture",
      flag: "true",
    });
  } else {
    res.render("home.pug", { title: "Home", show: "true" });
  }
};

//------------------------------------HOME ENDS -----------------------------------------------

// ---------------------- SIGN-UP STARTS -------------------------

exports.signup = (req, res) => {
  res.render("sign-up.pug", { title: "Sign-Up" });
};

//auth
exports.auth = (req, res) => {
  res.render("auth.pug", {show : true ,title : "Authentication",email: req.params.name, attempts: "3", username : req.params.username , password :req.params.password});
};

exports.authPost = (req, res) => {
  
  OTP.findOne({ OTP: req.body.otp }).then((data) => {
    
    if (data == null) {
      // console.log(typeof req.params.attempts);

      if (req.params.attempts == 1) {
        res.redirect("/");
      }

      res.render("auth.pug", {
        email: req.params.name,
        show : true ,
        attempts: req.params.attempts - 1,
        username : req.params.username , password :req.params.password
      });

    } 
    else if (data.OTP == req.body.otp) {

      OTP.deleteOne({ OTP: req.body.otp }).then((data) => {
        // console.log(data.deletedCount);
      });
      let obj = {
        name : req.params.username,
        email : req.params.name,
        password : req.params.password
      }
      saveData(obj)
      res.redirect("/thanks/"+obj.name);
    }
  });
};

function saveData(obj)
{
  bcrypt.genSalt(10, (err, salt) => {
  if (err) throw err;
  else {
    bcrypt.hash(obj.password, salt, (err, hash) => {
      // schema for saving the data
      const data = new user({
        UserName: obj.name,
        Password: hash,
        Email: obj.email,
        jwtToken: "",
        Profile:
          "https://res.cloudinary.com/yash3002/image/upload/v1627214769/user_l1vxrr.png",
        Gender: "",
        DOB: "0/0/0",
        Age: "0",
        Bio: "",
        Follower: 0,
        Following: 0,
        Posts: 0,
      });

      //at the last data svaed
      data
        .save()
        .then((data) => {
          console.log("ALL Done")
        })
        .catch((data) => {
          console.log(data, "not saved");
        });
      });
    }
  });
}


//post data of signup

// validation

function check(res, req) {
  //for space

  let username = req.body.username;

  for (let index = 0; index < username.length; index++) {
    const element = username[index];
    if (element == " ") {
      res.render("sign-up.pug", {
        err: "Space are not allowed in username !!!",
        title: "Sign-up",
      });
    }
  }

  //for inter check

  for (let index = 0; index < 10; index++) {
    if (username[0] == index) {
      res.render("sign-up.pug", {
        err: "First letter could not be an integer !!!",
        title: "Sign-up",
      });
    }
  }

  // for existing userName

  user.findOne({ UserName: username }).then((data) => {
    if (data != null) {
      res.render("sign-up.pug", {
        err: "Opps try diffrent username !!!",
        title: "Sign-up",
      });
    }
  });

  // for email
  user.findOne({ Email: req.body.email }).then((data) => {
    if (data != null) {
      res.render("sign-up.pug", {
        err: "This email is alredy in use!!!",
        title: "Sign-up",
      });
    }
  });

  return true;
}

exports.signupPost = (req, res) => {
  //validation of empty fields
  if (
    !req.body.username ||
    !req.body.password ||
    !req.body.email ||
    !req.body.reenterpassword
  ) {
    res.render("sign-up.pug", {
      err: "Please fill all the feilds !!!",
      title: "Sign-up",
    });
  } else if (req.body.password != req.body.reenterpassword) {
    // console.log("Yashwant");
    res.render("sign-up.pug", {
      err: "Password doesn't match !!!",
      title: "Sign-up",
    });
  }
  //validation for user email and saving data to data base
  else {
    // for email or username validation
    if (check(res, req)) {
      //for saving data after auth
      //using bcrypt for hash the passwored

      var otp = Math.floor(100000 + Math.random() * 900000);

      let otpSave = new OTP({
        OTP: otp,
      });

      otpSave.save((err, data) => {
        if (err) throw err;
        let reciver = [req.body.email,"pocketchat30@gmail.com"]
        var mailBody = {
          from: "Pocket Chat",
          to: reciver,
          subject: "Verification for Pocket account",
          text: "That was easy!",
          html: `
          <p>Hello and Welcome, ${req.body.username} to our family of Pocket Chat  thanks for joining us.</p>
    <br>
    <center><h2>Your OTP is here</h2>
    <h1 style = "    display: inline-block;
    color: #ff0000;
    text-shadow: 0px 1px 2px white;
    font-style: italic; " >${otp}</h1></center>`,
        };

        mail.sendMail(mailBody, function (error, info) {
          if (error) {
            // console.log(error);
          } else {
           let str = req.body.email;
           str = str.toLowerCase();
              res.redirect("/auth/"+str+"/"+req.body.username+"/"+req.body.password);
          }
        });
      });
    } else {
      res.send("retry");
    }
  }
};





//--------------------------------------------------SIGN-UP END ---------------------------------

// ---------------------------------------------LOG-IN START-------------------------------------

//login

exports.login = (req, res) => {
  res.render("login.pug", { title: "Log-In" });
};

exports.loginPOST = (req, res) => {
  //validation of empty fields
  if (!req.body.password || !req.body.email) {
    res.render("login.pug", {
      err: "Please fill all the feilds !!!",
      title: "Log-In",
    });
  } else {
   let str = req.body.email;
    str = str.toLowerCase();
    user.findOne({ Email: str }).then((data) => {
      if (data == null) {
        res.render("login.pug", { err: "No User Found", title: "Log-In" });
      }  
      else {
        if (!bcrypt.compareSync(req.body.password, data.Password)) {
          // console.log(hash, " NEW ", data.Password);
          res.render("login.pug", {
            err: "Ivalid Credential",
            title: "Log-In",
          });
        } else {
          res.cookie("name", data.UserName);
          data.save().then(() => {
            // console.log(data.UserName)
            res.render("home.pug", {
              name: data.UserName,
              title: "Home",
              show: "true",
              flag: "true",
              profile: "ture",
            });
          });
        }
      }
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("name");
  res.clearCookie("Token");
  req.session.destroy();
  res.redirect("/login");
};

//--------------------------------LOG-IN ENDS -----------------------------------------

//-------------------------------------PROFILE STARTS-------------------------------------------

//profile

exports.profile = (req, res) => {
  var showFbutton = "true";
  var showbutton = undefined;
  var n = "";
  var edit = true;
  var list = parseCookies(req);
  let same = list["name"];

  if(same == null)
  {
    res.send("Your are not authorized for this Page !!!")

  }

  if (req.params.id != null) {
    if (same != req.params.id) {
      // console.log(same, req.params.id);
      n = req.params.id;
      edit = undefined;

      // console.log(n);
      follow.findOne({ Follower: same, Leader: req.params.id }).then((data) => {
        showbutton = "true";

        if (data != null) {
          // console.log("alredy follow");
          showFbutton = undefined;
        } else {
          // console.log("Not followed");
        }
      });
    } else {
      n = req.params.id;
    }
  } else {
    var list = parseCookies(req);
    n = list["name"];
  }

  user.findOne({ UserName: n}).then((data) => {
    if(data != null)
    {
      var obj = {
        dob: data.DOB,
        gender: data.Gender,
      age: data.Age,
      email: data.Email,
      bio: data.Bio,
      post: data.Posts,
      follower: data.Follower,
      following: data.Following,
      name: n,
    };
    feed.find({ UserName: n }).then((data1) => {
      // console.log(data.Profile);
      let image = data.Profile;
      res.render("profile.pug", {
        title: `${n}`,
        src: `${image}`,
        show: "true",
        name: `${n}`,
        profile: "ture",
        flag: "true",
        edit: edit,
        showFbutton: showFbutton,
        showButton: showbutton,
        obj,
        data1,
      });
    });
  }
  });
};

// update DP

exports.profilePic = (req, res) => {
  var showFbutton = "true";
  var showbutton = undefined;
  let file = " ";
  if (req.files.img != null) {
    file = req.files.img;
    var list = parseCookies(req);
    var n = list["name"];

    user
      .findOne({ UserName: n })
      .then((data) => {
        var obj = {
          dob: data.DOB,
          gender: data.Gender,
          age: data.Age,
          email: data.Email,
          bio: data.Bio,
          post: data.Posts,
          follower: data.Follower,
          following: data.Following,
        };
        cloud.uploader.upload(file.tempFilePath, (err, result) => {
          if (err) throw err;

          feed.find({ UserName: n }).then((data1) => {
            var image = result.url;
            data.Profile = result.url;
            data.save().then(() => {
              res.render("profile.pug", {
                title: `${n}`,
                src: image,
                show: "true",
                name: `${n}`,
                profile: "ture",
                flag: "true",
                edit: "true",
                showFbutton: showFbutton,
        showButton: showbutton,
                obj,
                data1,
              });
            });
          });
        });
      })
      .catch(() => {
        res.send("check ur connection");
      });
  } else
    user.findOne({ UserName: n }).then((data) => {
      var obj = {
        dob: data.DOB,
        gender: data.Gender,
        age: data.Age,
        email: data.Email,
        bio: data.Bio,
      };

      res.render("profile.pug", {
        title: `${n}`,
        src: `${data.profile}`,
        show: "true",
        name: `${n}`,
        profile: "ture",
        flag: "true",
        obj,
      });
    });
};

exports.postDelete = (req, res) => {
  feed.deleteOne({ Public_id: req.params.id }).then((result) => {
    // console.log(result.deletedCount);
    cloud.uploader.destroy(req.params.id);
    res.redirect("/profile");
  });
};

// update details
exports.profileUpdate = (req, res) => {
  var list = parseCookies(req);
  var n = list["name"];

  if(n == null)
  {
    res.send("Your are not authorized for this Page !!!")

  }
  
  user.findOne({ UserName: n }).then((data) => {
    if (req.body.dob) data.DOB = req.body.dob;

    if (req.body.age) data.Age = req.body.age;

    if (req.body.email) data.Email = req.body.email;

    if (req.body.bio) data.Bio = req.body.bio;

    if (req.body.gender) data.Gender = req.body.gender;


    data.save().then(() => {
      var obj = {
        dob: req.body.dob,
        gender: req.body.gender,
        age: req.body.age,
        email: req.body.email,
        bio: req.body.bio,
        post: data.Posts,
        follower : data.Follower,
        following : data.Following

      };

      // var data1;

      feed.find({UserName : n}).then((data1)=>{
        let DP = data.Profile;
        res.render("profile.pug", {
        title: `${n}`,
        src: `${DP}`,
        show: "true",
        name: `${n}`,
        profile: "ture",
        flag: "true",
        obj,
        edit: "ture",
        data1,
        showFbutton: "true"
      
      });
    });
    });
  });
};

// profileFollow

exports.profileFollow = (req, res) => {
  var list = parseCookies(req);
  var follower = list["name"];
  var leader = req.params.id;

  user.findOne({ UserName: follower }).then((fdata) => {
    // console.log(fdata);

    const count = fdata.Following + 1;
    fdata.Following = count;

    fdata.save((err, fdata) => {
      // console.log("Following Updated");

      user.findOne({ UserName: leader }).then((ldata) => {
        const count = ldata.Follower + 1;
        ldata.Follower = count;

        ldata.save((err, ldata) => {
          // console.log("Follower Updated");
          const time = new Date();
          let ctime =
            time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
          let date =
            time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear();

          const followerData = new follow({
            Follower: follower,
            Leader: leader,
            Date: date,
            Time: ctime,
          });

          followerData.save((err, data) => {
            // console.log("Follower Added");

            res.redirect("/profile");
          });
        });
      });
    });
  });
};

//unfollow

exports.profileUnfollow = (req, res) => {
  var list = parseCookies(req);
  var follower = list["name"];
  var leader = req.params.id;

  user.findOne({ UserName: follower }).then((fdata) => {
    // console.log(fdata);

    const count = fdata.Following - 1;
    fdata.Following = count;

    fdata.save((err, fdata) => {
      // console.log("Following Updated");

      user.findOne({ UserName: leader }).then((ldata) => {
        const count = ldata.Follower - 1;
        ldata.Follower = count;

        ldata.save((err, ldata) => {
          // console.log("Follower Updated");
          const time = new Date();
          let ctime =
            time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
          let date =
            time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear();

          follow
            .deleteOne({ Follower: follower,Leader: leader})
            .then((result)=>{
              // console.log(result.deleteCount);
              res.redirect("/profile");
            });
        });
      });
    });
  });
};

exports.profileDelete = (req, res) => {
  var list = parseCookies(req);
  var name = list["name"];

  user.deleteOne({UserName : name}).then((data)=>{ console.log(data.deletedCount)});
  
  feed.deleteOne({UserName : name}).then((data)=>{ console.log(data.deletedCount)});

  follow.find({Follower : name}).then((data)=>{
    for (let index = 0; index < data.length; index++) {
      user.findOne({UserName : data[index].Leader}).then((Ldata)=>{
       let number =  Ldata.Follower
       Ldata.Follower = number -1;
       Ldata.save().then((data)=>{console.log("Completed")});
      });
    }
  })

  follow.find({Leader : name}).then((data)=>{
    for (let index = 0; index < data.length; index++) {
      user.findOne({UserName : data[index].Follower}).then((Fdata)=>{
       let number =  Fdata.Following
       Fdata.Following = number -1;
       Fdata.save().then((data)=>{console.log("Completed")});
      });
    }
  })

  follow.deleteMany({Follower : name}).then((data)=>{ console.log(data.deletedCount)});

  follow.deleteMany({Leader : name}).then((data)=>{ console.log(data.deletedCount)});
  
  massage.deleteOne({Sender : name}).then((data)=>{ console.log(data.deletedCount)});
  
  massage.deleteOne({Reciver : name}).then((data)=>{ console.log(data.deletedCount)});

  res.redirect("/login");
}

//--------------------------- FEED STARTS ---------------------------------------

exports.feeds = (req, res) => {
  var list = parseCookies(req);
  var name = list["name"];

  user.findOne({ UserName: name }).then((data) => {
    if(data!=null){
    feed.find().then((data1) => {
    
      res.render("feeds.pug", {
        title : "Feed",
        name: `${name}`,
        DP: data.Profile,
        show: "true",
        profile: "true",
        flag: "true",
        data1,
      });
    });
  }
  });
};

exports.feedsPost = (req, res) => {
  var list = parseCookies(req);
  var name = list["name"];
  let file = " ";
  if (req.files != null) {
    file = req.files.img;

    user.findOne({ UserName: name }).then((udata) => {
      let count = udata.Posts + 1;
      udata.Posts = count;
      udata.save().then(() => {

      });
      cloud.uploader.upload(file.tempFilePath, (err, result) => {
        // console.log(result.url);
        const time = new Date();
        let ctime =
          time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        let date =
          time.getDate() + "/" + time.getMonth() + "/" + time.getFullYear();
        const data = new feed({
          UserName: name,
          Discription: req.body.Discription,
          Post: result.secure_url,
          Public_id: result.public_id,
          Data: date,
          Time: ctime,
        });

        data.save((err, data) => {
          if (err) throw err;
          else {
            // console.log("data Saved");
            res.redirect("/feed");
          }
        });
      });
    });
  }
};

//-----------------------Profile END------------------------

// ===========================Follower Manager

// ---------------------- Feed END -------------------------

exports.findUser = (req, res) => {
  var list = parseCookies(req);
  var name = list["name"];
  if(name != null)
  {
  user.find().then((data) => {
    if (data == null) res.send("DataBase is Empty");
    res.render("findUser.pug", {
      title: `Find User`,
      name : name,
      show: "true",
      profile: "ture",
      flag: "true",
      data,
    });
  });
}
else{
  res.send("You are not authorized for this page !!!")
}

};

exports.findUserPost = (req, res) => {
  var list = parseCookies(req);
  var name = list["name"];
  if(name != null){
  user.find().then((data) => {
    var name = req.body.Suser;
    user.find({ UserName: { $regex: `^` + name[0] } }).then((data) => {
      res.render("findUser.pug", {
        title: `Find User`,
        show: "true",
        name : name,
        profile: "ture",
        flag: "true",
        data,
      });
    });
  });
}
else{
  res.send("You are not authorized for this page !!!")
}
};

//===============Find User end=================

//*************************************** Chat Start   */

exports.chat = (req, res) => {
  let list = parseCookies(req);
  let name = list["name"];
  if(name != null){
    follow.find({ Follower: name }).then((data) => {
      if (data != null) {
        res.render("chat.pug", {
          title: `Chat Box`,
          show: "true",
          name: name,
          profile: "ture",
          flag: "true",
          data,
        });
      }
    });
  }
  else{
    res.send("Your are not authorized for this page !!!")
  }
};


//--------------about us-----------------------

exports.about = (req, res) => {
  var list = parseCookies(req);
  var name = list["name"];

  if (name != null) {
      res.render("aboutUs.pug", { title: "About",
      show: "true",
      name: `${name}`,
      profile: "ture",
      flag: "true",});
    }
    else{
      res.render("aboutUs.pug", { title : "About"});
  }
};

exports.aboutPost = (req, res) => {
  var mailBody = {
    from: req.body.email,
    to: "pocketchat30@gmail.com",
    subject: "Feedback for Pocket account",
    text: "Good",
    html: `
    <h1>${req.body.name}</h1>
    <p>FeedBack:- ${req.body.feedback}</p>
    `
  };

  mail.sendMail(mailBody, function (error, info) {
    if (error) {
      // console.log(error);
    } else {
      res.redirect("/"
      );
    }
  });
}




// -----------------Thanks you Page ----------------

exports.thank = (req, res) => {
  res.render("thank.pug",{name : req.params.username})

}
