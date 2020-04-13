const express = require('express')
const router = express.Router()

const BookModel = require('../models/Book.js')
const MovieModel = require('../models/Movie.js')
const MusicModel = require('../models/Music.js')

// Books
router.post('/books/create', (req, res) => {
  BookModel.create({
    author: req.body.author,
    live: req.body.live,
    cover: req.body.cover,
    link: req.body.link,
    summary: req.body.summary,
    title: req.body.title
  })
  res.json(req.body)
})
router.get('/books/get', (req, res) => {
  BookModel.find({} , (error, data) => {
    if (error) console.error(error)
    else {
      var books = []
      data.forEach(book => {
        books.push(book)
      })
      res.json(books)
    }
  })
})
router.get('/books/read/:title', (req, res) => {
  BookModel.findOne({ title: req.params.title }, (error, data) => {
    if (error) console.error(error)
    else res.json(data)
  })
})
router.get('/books/download/:title', (req, res) => {
  BookModel.findOne({ title: req.params.title }, (error, data) => {
    if (error) console.error(error)
    else res.download(data.link)
  })
})


// Movies
router.post('/movies/create', (req, res) => {
  MovieModel.create({
    genre: req.body.genre,
    live: req.body.live,
    cover: req.body.cover,
    link: req.body.link,
    summary: req.body.summary,
    title: req.body.title
  })
  res.json(req.body)
})
router.get('/movies/get', (req, res) => {
  MovieModel.find({} , (error, data) => {
    if (error) console.error(error)
    else {
      var movies = []
      data.forEach(movie => {
        movies.push(movie)
      })
      res.json(movies)
    }
  })
})
router.get('/movies/read/:title', (req, res) => {
  MovieModel.findOne({ title: req.params.title }, (error, data) => {
    if (error) console.error(error)
    else res.json(data)
  })
})
router.get('/movies/download/:title', (req, res) => {
  MovieModel.findOne({ title: req.params.title }, (error, data) => {
    if (error) console.error(error)
    else res.download(data.link)
  })
})


// -- Music
router.post('/music/create', (req, res) => {
  MusicModel.create({
    artist: req.body.artist,
    live: req.body.live,
    cover: req.body.cover,
    title: req.body.title,
    songs: req.body.songs,
    genre: req.body.genre
  })
  res.json(req.body)
})
router.get('/music/get', (req, res) => {
  MusicModel.find({} , (error, data) => {
    if (error) console.error(error)
    else {
      var music = []
      data.forEach(musics => {
        music.push(musics)
      })
      res.json(music)
    }
  })
})
router.get('/music/read/:title', (req, res) => {
  MusicModel.findOne({ title: req.params.title }, (error, data) => {
    if (error) console.error(error)
    else res.json(data)
  })
})


module.exports = router