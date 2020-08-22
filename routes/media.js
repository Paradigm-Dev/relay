const express = require('express')
const mongoose = require('mongoose')
const formidable = require('formidable')
const Jimp = require('jimp')
const fs = require('fs')

const router = express.Router()

const BookModel = require('../models/Book.js')
const MovieModel = require('../models/Movie.js')
const MusicModel = require('../models/Music.js')

// Books
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
router.get('/books/download/:title', (req, res) => {
  BookModel.findOne({ title: req.params.title }, (error, data) => {
    if (error) console.error(error)
    else res.download(data.link)
  })
})


// Movies
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
router.get('/movies/download/:title', (req, res) => {
  MovieModel.findOne({ title: req.params.title }, (error, data) => {
    if (error) console.error(error)
    else res.download(data.link)
  })
})


// -- Music
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


// Upload
router.post('/create/data', async (req, res) => {
  // console.log(req.body)
  let _id
  switch (req.body.type) {
    case 'book':
      _id = new mongoose.Types.ObjectId()
      await BookModel.create({
        _id,
        author: req.body.author,
        live: true,
        cover: `https://www.theparadigmdev.com/relay/books/img/${_id.toString()}.jpg`,
        link: `https://www.theparadigmdev.com/relay/books/${_id.toString()}.pdf`,
        summary: req.body.summary,
        title: req.body.title
      }, (error, book) => res.json({ _id: book._id }))
      break
    case 'movie':
      _id = new mongoose.Types.ObjectId()
      await MovieModel.create({
        _id,
        genre: req.body.genre,
        live: true,
        cover: `https://www.theparadigmdev.com/relay/movies/img/${_id.toString()}.jpg`,
        link: `https://www.theparadigmdev.com/relay/movies/${_id.toString()}.mp4`,
        summary: req.body.summary,
        title: req.body.title
      }, (error, movie) => res.json({ _id: movie._id }))
      // console.log(_id)
      break
    case 'music':
      _id = new mongoose.Types.ObjectId()
      await MusicModel.create({
        _id,
        artist: req.body.artist,
        live: true,
        cover: `https://www.theparadigmdev.com/relay/music/img/${_id.toString()}.jpg`,
        genre: req.body.genre,
        title: req.body.title,
        songs: req.body.songs
      }, (error, album) => res.json({ _id: album._id }))
      break
  }
})

router.post('/create/:id/files/:type', async (req, res) => {
  var Item
  switch (req.params.type) {
    case 'book': Item = await BookModel.findOne({ _id: req.params.id }); break;
    case 'movie': Item = await MovieModel.findOne({ _id: req.params.id }); break;
    case 'music': Item = await MusicModel.findOne({ _id: req.params.id }); break;
  }

  const form = formidable({ multiples: false, uploadDir: __dirname + `/../files/${req.params.type == 'music' ? 'music' : req.params.type + 's'}/`, keepExtensions: true })

  await form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err)
      return
    }

    console.log(files)

    await Jimp.read(files.cover.path).then(img => {
      return img.write(__dirname + `/../files/${req.params.type == 'music' ? 'music' : req.params.type + 's'}/img/${Item._id}.jpg`)
    }).catch(error => console.error(error))
    if (req.params.type != 'music') await fs.renameSync(files.file.path, __dirname + `/../files/${req.params.type + 's'}/${Item._id}.${files.file.name.slice(files.file.name.lastIndexOf('.') + 1)}`)
    else {
      await fs.mkdirSync(__dirname + `/../files/music/${Item._id}`)
      await Item.songs.forEach(async song => {
        song.file = `https://www.theparadigmdev.com/relay/music/${Item._id}/${song.track}.${files[song.track].name.slice(files[song.track].name.lastIndexOf('.') + 1)}`
        await fs.renameSync(files[song.track].path, __dirname + `/../files/music/${Item._id}/${song.track}.${files[song.track].name.slice(files[song.track].name.lastIndexOf('.') + 1)}`)
      })
      await Item.save()
    }
    res.json(Item)
  })
})

module.exports = router