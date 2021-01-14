const mongoose = require("mongoose");

const ThreadUserSchema = new mongoose.Schema({
  username: String,
  color: String,
  _id: String,
});

const ReplySchema = new mongoose.Schema({
  attachment: Object,
  content: String,
  timestamp: Number,
  timestamp_formatted: String,
  user: ThreadUserSchema,
  replies: Array,
});

const ThreadSchema = new mongoose.Schema({
  attachment: Object,
  title: String,
  op: String,
  user: ThreadUserSchema,
  timestamp: Number,
  timestamp_formatted: String,
  replies: [ReplySchema],
});

const ThreadModel = mongoose.model("thread", ThreadSchema);

module.exports = ThreadModel;
