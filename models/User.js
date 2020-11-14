const mongoose = require("mongoose");

const UserBookSchema = new mongoose.Schema({
  book_id: String,
  rating: Number,
  favorite: Boolean,
});

const UserMovieSchema = new mongoose.Schema({
  movie_id: String,
  rating: Number,
  favorite: Boolean,
});

const UserMusicSchema = new mongoose.Schema({
  music_id: String,
  rating: Number,
  favorite: Boolean,
});

const StoredChatroomSchema = new mongoose.Schema({
  name: String,
  id: String,
  icon: String,
  status: String,
});

const FileSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: String,
  date: String,
  path: String,
});

const FriendSchema = new mongoose.Schema({
  _id: String,
  username: String,
  color: String,
  liked_posts: [String],
  dm: String,
});

const PostSchema = new mongoose.Schema({
  content: String,
  timestamp: String,
  likes: Number,
  reposts: Number,
  files: Array,
});

const PreflightSchema = new mongoose.Schema({
  in_recovery: Boolean,
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  bio: String,
  color: String,
  chatrooms: [StoredChatroomSchema],
  people: {
    requests: [FriendSchema],
    approved: [FriendSchema],
    blocked: [FriendSchema],
    sent: [FriendSchema],
    blocked_by: [String],
  },
  rights: {
    admin: Boolean,
    author: Boolean,
    asteroid: Boolean,
    patriot: Boolean,
    developer: Boolean,
    apollo: Boolean,
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
  posts: [PostSchema],
  apollo_codes: {
    created: Number,
    quota: Number,
  },
  pinned_apps: [String],
  preflight: mongoose.Schema.Types.Mixed,
  notifications: Array,
  code: String,
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
