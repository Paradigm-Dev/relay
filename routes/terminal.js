const express = require("express");
const router = express.Router();

const UserModel = require("./../models/User.js");
const ChatroomModel = require("./../models/Chatroom.js");
const BookModel = require("./../models/Book.js");
const MovieModel = require("./../models/Movie.js");
const MusicModel = require("./../models/Music.js");
const ConfigModel = require("../models/Config.js");

router.get("/user/:username/view", async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.username });
  if (User) {
    var user = {
      username: User.username,
      color: User.color,
      _id: User._id,
      bio: User.bio,
      moonrocks: User.moonrocks,
      rights: {
        admin: User.rights.admin,
        author: User.rights.author,
        asteroid: User.rights.asteroid,
        developer: User.rights.developer,
      },
      banned: User.banned,
      strikes: User.strikes,
      in: User.in,
    };
    res.json(user);
  } else res.json({ error: `user ${req.params.username} not found` });
});

router.get("/user/:username/strike", async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.username });
  if (!User.strikes) User.strikes = 0;
  User.strikes = parseInt(User.strikes, 10) + 1;
  await User.save();
  res.end();
});

router.get("/user/:username/delete", async (req, res) => {
  await UserModel.findOneAndDelete({ username: req.params.username });
  res.end();
});

router.get("/list/users", async (req, res) => {
  var Users = await UserModel.find({});
  var users = [];
  Users.forEach((user) => {
    users.push(user.username);
  });
  res.json(users);
});

router.get("/list/chatrooms", async (req, res) => {
  var Chatrooms = await ChatroomModel.find({});
  var chatrooms = [];
  Chatrooms.forEach((chatroom) => {
    chatrooms.push(`{ name: ${chatroom.name}, id: ${chatroom.id} }`);
  });
  res.json(chatrooms);
});

router.get("/list/books", async (req, res) => {
  var Books = await BookModel.find({});
  var books = [];
  Books.forEach((book) => {
    books.push(`{ title: ${book.title}, author: ${book.author} }`);
  });
  res.json(books);
});

router.get("/list/movies", async (req, res) => {
  var Movies = await MovieModel.find({});
  var movies = [];
  Movies.forEach((movie) => {
    movies.push(movie.title);
  });
  res.json(movies);
});

router.get("/list/music", async (req, res) => {
  var Music = await MusicModel.find({});
  var music = [];
  Music.forEach((album) => {
    music.push(`{ title: ${album.title}, artist: ${album.artist} }`);
  });
  res.json(music);
});

router.put("/app", async (req, res) => {
  await ConfigModel.findOneAndUpdate(
    { find: "this" },
    { $set: { [`apps.${req.body.app}.${req.body.key}`]: req.body.value } },
  );
  res.json(await ConfigModel.findOne({ find: "this" }));
});

module.exports = router;
