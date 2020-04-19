const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  color: String,
  username: String,
  user_id: String,
  content: String,
  pic: String,
  timestamp: String,
  edits: Number,
  type: String
})

const ChatroomSchema = new mongoose.Schema({
  messages: [MessageSchema],
  icon: String,
  id: String,
  name: String,
  owner: String,
  owner_id: String,
  theme: String
})

const ChatroomModel = mongoose.model('chatroom', ChatroomSchema)

module.exports = ChatroomModel