const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  color: String,
  username: String,
  user_id: String,
  content: String,
  pic: String,
  timestamp: String,
  edits: Number,
  type: String,
  url: String,
});

const PersonSchema = new mongoose.Schema({
  _id: String,
  username: String,
  color: String,
  pic: String,
});

const DMSchema = new mongoose.Schema({
  messages: [MessageSchema],
  people: [PersonSchema],
});

const DMModel = mongoose.model("dm", DMSchema);

module.exports = DMModel;
