const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  color: String,
  username: String,
  user_id: String,
  content: String,
  timestamp: String,
  edits: Number,
  type: String,
  url: String,
});

const PersonSchema = new mongoose.Schema({
  _id: String,
  username: String,
  color: String,
});

const ChatroomSchema = new mongoose.Schema({
  messages: [MessageSchema],
  icon: String,
  id: String,
  name: String,
  owner: String,
  theme: String,
  people: {
    approved: [PersonSchema],
    requested: [PersonSchema],
    banned: [PersonSchema],
  },
});

const ChatroomModel = mongoose.model("chatroom", ChatroomSchema);

module.exports = ChatroomModel;
