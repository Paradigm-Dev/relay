const mongoose = require('mongoose')

const SongSchema = new mongoose.Schema({
  title: String,
  file: String,
  length: String,
  track: String,
  lyrics: mongoose.Schema.Types.Mixed
})

const MusicSchema = new mongoose.Schema({
  artist: String,
  live: Boolean,
  cover: String,
  title: String,
  songs: [SongSchema],
  genre: String
})

const MusicModel = mongoose.model('music', MusicSchema)

module.exports = MusicModel