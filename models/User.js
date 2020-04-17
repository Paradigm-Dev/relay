const mongoose = require('mongoose')

const UserBookSchema = new mongoose.Schema({
  book_id: String,
  rating: Number,
  favorite: Boolean
})

const UserMovieSchema = new mongoose.Schema({
  movie_id: String,
  rating: Number,
  favorite: Boolean
})

const UserMusicSchema = new mongoose.Schema({
  music_id: String,
  rating: Number,
  favorite: Boolean
})

const StoredChatroomSchema = new mongoose.Schema({
  name: String,
  id: String,
  icon: String
})

const FriendSchema = new mongoose.Schema({
  username: String,
  pic: String,
  color: String
})

const FileSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: String,
  date: String,
  path: String
})

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  bio: String,
  color: String,
  pic: String,
  chatrooms: [StoredChatroomSchema],
  friends: [FriendSchema],
  rights: {
    admin: Boolean,
    author: Boolean,
    asteroid: Boolean,
    patriot: Boolean
  },
  moonrocks: Number,
  books: [UserBookSchema],
  movies: [UserMovieSchema],
  music: [UserMusicSchema],
  files: [FileSchema],
  banned: Boolean,
  strikes: Number,
  in: Boolean,
  created: String
})

const UserModel = mongoose.model('user', UserSchema)

module.exports = UserModel