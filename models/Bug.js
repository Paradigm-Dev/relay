const mongoose = require("mongoose");

const BugSchema = new mongoose.Schema(
  {
    uid: String,
    title: String,
    category: String,
    location: String,
    priority: Number,
    description: String,
    username: String,
    fixed: Boolean,
  },
  { collection: "bugs" }
);

const BugModel = mongoose.model("bug", BugSchema);

module.exports = BugModel;
