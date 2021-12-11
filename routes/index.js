const express = require('express');
const router = express.Router();
const userModel = require('./users');
const localstrategy = require('passport-local');
const passport = require('passport');
const postModel = require('./post')
const multer = require('multer');
const commentModel = require('./comment')
const { v4: uuidv4 } = require('uuid');
const sendmail = require('./nodemailer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + file.originalname)
  }
})
const upload = multer({ storage: storage })
passport.use(new localstrategy(userModel.authenticate()));
router.get('/', function(req, res) {
  res.render('index',{pagename:'Login page'});
});
router.post('/register',function(req,res){
  var newUser = new userModel({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email
  });
  userModel.register(newUser,req.body.password)
  .then(function(createdUser){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile');
    });
  });
});
router.post('/login',passport.authenticate('local',{
successRedirect:'/profile',
failureRedirect:'/'
}),function(req,res,next){});
router.get('/logout',function(req,res,next){
  req.logOut();
  res.redirect('/');
});
function isLoggedIn(req,res,next){
  if(req.isAuthenticated())
  return next();
  res.redirect('/')
};
router.get('/reg',function(req,res){
  res.render('register',{pagename:'Register page'})
})
router.get('/profile',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.find()
    .populate("author comments")
    .then(function(allPosts){
      console.log((allPosts))
      res.render('profile',{allPosts,foundUser,pagename:'Timeline'})
    });
  });
});
router.get('/create',isLoggedIn,function(req,res){
  res.render('createpost',{pagename:'Create posts'});
});
router.post('/createPost',upload.single('content'),function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.create({
      content:req.file.filename,
      desc:req.body.desc,
      author:foundUser
    })
    .then(function(createdPost){
      foundUser.posts.push(createdPost)
      foundUser.save()
      .then(function(saved){
        res.redirect('/profile');
      });
    });
  });
});
router.get('/likes/:id',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
      postModel.findOne({_id:req.params.id})
      .populate("likes")
      .then(function(foundPost){
        console.log(foundPost)
        if(foundPost.likes.indexOf(foundUser._id) == -1){
          foundPost.likes.push(foundUser._id)
        }
        else
        {
          var index = foundPost.likes.indexOf(foundUser._id);
          foundPost.likes.splice(index,1);
        }
        foundPost.save()
        .then(function(saved){
          res.redirect(req.headers.referer)
        })
    })
  })
});
router.post('/comments/:id',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.findOne({_id:req.params.id})
    .then(function(foundPost){
      commentModel.create({
        postid:req.params.id,
        user:foundUser.name,
        cmnt:req.body.comment
      })
      .then(function(createdComment){
        foundPost.comments.push(createdComment)
        foundPost.save()
        .then(function(saved){
          res.redirect(req.headers.referer)
        })
      })
    })
  })
})
router.get('/mypost',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .populate("posts") 
  .populate({
      path:'posts',
      populate:{
        path:'comments',
        model:'comment'
      }
    })
  .then(function(foundUser){
    console.log(foundUser)
    res.render('mypost',{foundUser,pagename:'My posts'})
  });
});
router.post('/upload',upload.single('image'),function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    foundUser.profilepic = req.file.filename
    foundUser.save()
    .then(function(saved){
      res.redirect('/mypost')
    })
  })
});
router.get('/reset',function(req,res){
  res.render('resetpage',{pagename:'reset page'})
})
router.post('/reset',function(req,res){
  userModel.findOne({email:req.body.email})
  .then(function(foundUser){
    if(foundUser!==null){
    var secret= uuidv4();
    foundUser.secret = secret;
    foundUser.save()
    sendmail("shrivastavshourya28@gmail.com",`http://localhost:3000/${foundUser._id}/${secret}`)
    .then(function(){
      res.send('mail sent!')
    })}
    else{
      res.send("No such user")
    }
  })
})
router.get('/reset/:id/:secret',isLoggedIn,function(req,res){
  userModel.findOne({_id:req.params.id})
  .then(function(foundUser){
    if(foundUser.secret === req.params.secret){
      res.render('pwdpage',{pagename:'Create new password',foundUser})
    }
  })
})
router.post('/newpassword/:id',function(req,res){ 
  userModel.findOne({_id:req.params.id})
  .then(function(foundUser){
    if(req.body.password1 === req.body.password2){
      foundUser.setPassword = req.body.password1;
      foundUser.save()
      .then(function(){
        res.redirect('/mid');
      })
    }
  })
})
router.get('/mid',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  then(function(foundUser){
    req.logIn(foundUser)
    .then(function(){
      res.redirect('/profile');
    })
  })
})


module.exports = router;














// router.get('/reacts/:postid', isLoggedIn, function (req, res) {
//   userModel.findOne({username:req.session.passport.user})
//   .then(function(foundUser){
//     postModel.findOne({_id:req.params.postid})
//     .populate("comments")
//       .then(function (foundpost){
//         console.log(foundpost)
//         if(foundpost.comments.reacts.indexOf(username._id) == -1){
//           foundpost.comments.reacts.push(username._id); 
//         }
//         else{
//           let index = foundpost.comments.reacts.indexOf(username._id);
//           foundpost.comments.reacts.splice(index,1);
//         }
//         foundpost.save().then(function(savedPost){
//           res.redirect(req.headers.referer)
//         })
//       });
//   });
// });