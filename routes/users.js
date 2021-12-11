const mongoose =require('mongoose');
const plm = require('passport-local-mongoose');
const { stringify } = require('uuid');

mongoose.connect('mongodb://localhost/fbdat');

const userSchema = mongoose.Schema({
  name:String,
  username:String,
  password:String,
  email:String,
  profilepic:String,
  secret:String,
  expiry:{type:String},
  posts:[{type:mongoose.Schema.Types.ObjectId,ref:'post'}]
});

userSchema.plugin(plm);

module.exports = mongoose.model('user',userSchema);