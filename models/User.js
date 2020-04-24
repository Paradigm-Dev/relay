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

const FileSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: String,
  date: String,
  path: String
})

const FriendSchema = new mongoose.Schema({
  _id: String,
  username: String,
  color: String,
  pic: String
})

const PostSchema = new mongoose.Schema({
  content: String,
  timestamp: String,
  likes: Number,
  reposts: Number
})

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  bio: String,
  color: String,
  pic: String,
  chatrooms: [StoredChatroomSchema],
  people: {
    requests: [FriendSchema],
    approved: [FriendSchema],
    blocked: [FriendSchema],
    sent: [FriendSchema],
    blocked_by: [String]
  },
  rights: {
    admin: Boolean,
    author: Boolean,
    asteroid: Boolean,
    patriot: Boolean,
    developer: Boolean
  },
  moonrocks: Number,
  books: [UserBookSchema],
  movies: [UserMovieSchema],
  music: [UserMusicSchema],
  files: [FileSchema],
  banned: Boolean,
  strikes: Number,
  in: Boolean,
  created: String,
  posts: [PostSchema]
})

const UserModel = mongoose.model('user', UserSchema)

module.exports = UserModel