const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  genre: String,
  live: Boolean,
  cover: String,
  link: String,
  summary: String,
  title: String,
});

const MovieModel = mongoose.model("movie", MovieSchema);

module.exports = MovieModel;
