const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    content:String,
    desc:String,
    likes:{
        type:Array,
        default:[]
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'comment'
    }],
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
});

module.exports = mongoose.model('post',postSchema);