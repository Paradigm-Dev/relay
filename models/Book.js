const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  author: String,
  live: Boolean,
  cover: String,
  link: String,
  summary: String,
  title: String,
});

const BookModel = mongoose.model("book", BookSchema);

module.exports = BookModel;
