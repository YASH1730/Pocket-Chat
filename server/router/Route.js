const controller = require('./controller/Controller')
const router = require('express').Router();
const session = require("express-session")
const cook = require('cookie-parser')
const fileupload = require('express-fileupload')
const cloud = require('cloudinary').v2;

router.use(cook());

router.use(fileupload({
    useTempFiles:true
  }))

// caching disabled for every route
router.use(dis = (req, res, next) => {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


  
cloud.config({ 
    cloud_name: 'yash3002', 
    api_key: '643584389219926', 
    api_secret: 'zOQIoqv3UvShZkvgAkAscgv9S6g',
    secure: true
  });


//body parser
var body = require('body-parser')
var encoder = body.urlencoded();

router.use(session({secret : "asdlajlksdfhalsdfhalfj"}))

//home

router.get('/',controller.main);
router.post('/',dis,controller.main);

//login
router.get('/login',dis,controller.login);
router.post('/login/post',controller.loginPOST);
router.get('/logout',dis,controller.logout);

//signup
router.get('/signup',controller.signup);
router.post('/signup/post',encoder,controller.signupPost);

//auth
router.get("/auth/:name/:username/:password",controller.auth)
router.post("/auth/:name/:attempts/:username/:password",controller.authPost)

//profile 
router.get('/profile',controller.profile)
router.get('/profile/:id',controller.profile)
router.post('/profile/pic',controller.profilePic)
router.post('/profile/update',controller.profileUpdate)
router.get('/profile/follow/:id',controller.profileFollow)
router.get('/profile/unfollow/:id',controller.profileUnfollow)
router.get('/profile/deletePost/:id',controller.postDelete)
router.post('/profile/delete/:id',controller.profileDelete)

//feeds
router.get('/feed',controller.feeds)
router.post('/feed/post',controller.feedsPost)

//chat 

router.get('/chat/:id',controller.chat)

//Find  users

router.get('/user',controller.findUser)
router.post('/user/find',controller.findUserPost)

// thanks page 

router.get('/thanks/:username',controller.thank)

module.exports= router;
