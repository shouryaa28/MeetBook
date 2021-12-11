const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  postid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post'
  },
  user: {
    type: String
  },
  cmnt: String,
  reacts:{
    type: Array,
    default: []
  }
});

module.exports = mongoose.model('comment', commentSchema);