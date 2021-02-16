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
  files: {
    required: false,
    type: Array,
  },
});

const FriendSchema = new mongoose.Schema({
  _id: String,
  username: String,
  color: String,
  liked_posts: [String],
  dm: String,
  subscribed: Boolean,
});

const PostSchema = new mongoose.Schema({
  content: String,
  timestamp: Number,
  timestamp_formatted: String,
  likes: Number,
  reposts: Number,
  file: Object,
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
  books: [UserBookSchema],
  movies: [UserMovieSchema],
  music: [UserMusicSchema],
  files: [FileSchema],
  strikes: Number,
  in: Boolean,
  posts: [PostSchema],
  apollo_codes: {
    created: Number,
    quota: Number,
  },
  pinned_apps: [Object],
  preflight: mongoose.Schema.Types.Mixed,
  notifications: Array,
  code: String,
  asteroid: Object,
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
