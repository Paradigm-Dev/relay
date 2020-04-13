const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  color: String,
  username: String,
  content: String,
  pic: String,
  timestamp: String,
  edits: Number
})

const ChatroomSchema = new mongoose.Schema({
  messages: [MessageSchema],
  icon: String,
  id: String,
  name: String,
  owner: String,
  theme: String
})

const ChatroomModel = mongoose.model('chatroom', ChatroomSchema)

module.exports = ChatroomModel