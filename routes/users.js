const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const _path = require('path')
const formidable = require('formidable')
const fs = require('fs')
const moment = require('moment')

const UserModel = require('../models/User.js')
const ChatroomModel = require('../models/Chatroom.js')
const BookModel = require('../models/Book.js')
const MovieModel = require('../models/Movie.js')
const MusicModel = require('../models/Music.js')

// Register
router.post('/register', (req, res) => {
  UserModel.findOne({ username: req.body.username }).then(user => {
    if (user) {
      res.json({ msg: 'User already exists' })
    } else {
      var newUser = new UserModel({
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
        color: req.body.color,
        rights: req.body.rights,
        moonrocks: req.body.moonrocks,
        created: moment().format('dddd, MMMM Do YYYY [at] h:mm a')
      })

      fs.mkdirSync(__dirname + '/../drawer/' + newUser.username)

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err
          newUser.password = hash
          newUser.save().then(user => {
            res.json(user)
          }).catch(err => console.error(err))
        })
      })
    }
  })
})

// Sign in
router.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      res.json({ msg: 'The username and password does not match an account.' })
    }
    if (!err && user) {
      user.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + user.pic
      res.json(user)
      req.login(user, next)
    }
  })(req, res, next)
})

// Sign out
router.get('/signout', (req, res) => {
  req.logout()
  res.end()
})

router.post('/reset', async (req, res) => {
  var user = await UserModel.findOne({ username: req.body.username })
  bcrypt.genSalt(10, (error, salt) => {
    bcrypt.hash(req.body.password, salt, (error, hash) => {
      if (error) throw error
      user.password = hash
      user
        .save()
        .then(user => {
          res.json(user)
        })
        .catch(err => console.error(err))
    })
  })
})

router.post('/update', async (req, res) => {
  var user = await UserModel.findOne({ username: req.body.old })
  user.username = req.body.username
  user.bio = req.body.bio
  user.color = req.body.color
  await user.save()
  user.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + user.pic
  res.json(user)
})

// Chatroom functions
router.get('/:uid/chatroom/:id/:func', async (req, res) => {
  switch (req.params.func) {
    case 'add':
      ChatroomModel.findOne({ id: req.params.id }, async (error, data) => {
        if (!error) {
          var User = await UserModel.findOne({ username: req.params.uid })
          User.chatrooms.push({
            name: data.name,
            id: data.id,
            icon: data.icon
          })
          await User.save()
          User.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + User.pic
          res.json(User)
        }
      })
      break
    case 'leave':
      var User = await UserModel.findOne({ username: req.params.uid })
      var Index = User.chatrooms.findIndex(chatroom => {
        return chatroom.id == req.params.id
      })
      User.chatrooms[Index].remove()
      await User.save()
      res.json(User)
  }
})

// Add/remove moonrocks
router.get('/:uid/moonrocks/:diff', (req, res) => {
  UserModel.findOneAndUpdate({ username: req.params.uid }, { $inc: { moonrocks: parseInt(req.params.diff) } }, (error, data) => {
    console.log(data)
    res.json(data)
  })
})

// Get list of files in Drawer
router.get('/:uid/drawer/list', (req, res) => {
  UserModel.findOne({ username: req.params.uid }, (error, data) => {
    if (!error) res.json(data.files)
    else {
      console.error(error)
      res.end()
    }
  })
})

// Get profile pic
router.get('/:uid/pic', async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.uid })
  res.sendFile(_path.join(__dirname + '/../files/profile-pics/' + User.pic + '.jpg'))
})

// Post profile pic
router.post('/:uid/pic', (req, res) => {
  var form = new formidable.IncomingForm()

  form.parse(req)

  form.on('fileBegin', (name, file) => {
    file.path = __dirname + '/../files/profile-pics/' + req.params.uid + '.jpg'
  })

  form.on('end', async () => {
    var User = await UserModel.findOne({ username: req.params.uid })
    User.pic = User.username + '.jpg'
    await User.save()
    User.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + User.pic
    res.json(User)
  })
})

router.get('/:uid/delete', async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.uid })
  async function deleteFolderRecursive(path) {
    fs.readdir(path, async (error, files) => {
      if (error) console.error(error)
      else {
        await files.forEach(async file => {
          var curPath = path + '/' + file
          await fs.lstat(curPath, async (error, stats) => {
            if (stats.isDirectory()) {
              deleteFolderRecursive(curPath)
            } else {
              await fs.unlink(curPath, () => {})
            }
          })
        })
      }
      fs.rmdir(path, async error => {
        fs.unlink(_path.join(__dirname + '/../files/profile-pics/' + User.pic), async error => {
          if (error) console.error(error)
          await UserModel.findOneAndDelete({ username: req.params.uid })
          res.end()
        })
      })
    })
  }
  deleteFolderRecursive(__dirname + '/../drawer/' + req.params.uid)
})


// Media
// -- Books
router.get('/:uid/media/books/:id/get', async (req, res) => {
  var sending = {}
  var user = await UserModel.findOne({ username: req.params.uid })
  await BookModel.findById(req.params.id, async (error, data) => {
    if (error) console.error(error)
    else {
      var userBook = await user.books.find(book => {
        return book.book_id == req.params.id
      })

      if (userBook != undefined) {
        sending = {
          author: data.author,
          live: data.live,
          cover: data.cover,
          link: data.link,
          summary: data.summary,
          title: data.title,
          rating: userBook.rating,
          favorite: userBook.favorite,
          _id: data._id,
          __v: data.__v
        }
        res.json(sending)
      } else {
        await BookModel.findById(req.params.id, async (error, data) => {
          if (error) console.error(error)
          else {
            sending = {
              author: data.author,
              live: data.live,
              cover: data.cover,
              link: data.link,
              summary: data.summary,
              title: data.title,
              rating: null,
              favorite: false,
              _id: data._id,
              __v: data.__v
            }
            book = {
              book_id: data._id,
              rating: null,
              favorite: false
            }
            var user = await UserModel.findOne({ username: req.params.uid })
            user.books.push(book)
            await user.save()
            res.json(sending)
          }
        })
      }
    }
  })
})
router.get('/:uid/media/books/:id/add', async (req, res) => {
  var book
  await BookModel.findById(req.params.id, (error, data) => {
    if (error) console.error(error)
    else {
      book = {
        book_id: data._id,
        rating: null,
        favorite: false
      }
    }
  })
  var user = await UserModel.findOne({ username: req.params.uid })
  user.books.push(book)
  user.save(() => {
    console.log(book)
    console.log(user)
    res.end()
  })
})
router.post('/:uid/media/books/:id/update', async (req, res) => {
  var user = await UserModel.findOne({ username: req.params.uid })

  var subdocId
  user.books.forEach(async book => {
    if (book.book_id == req.params.id) subdocId = book._id
  })

  var book = user.books.id(subdocId)
  book.$set({
    book_id: req.params.id,
    rating: req.body.rating,
    favorite: req.body.favorite
  })
  var saved = await user.save()
  res.json(saved)
})

// -- Movies
router.get('/:uid/media/movies/:id/get', async (req, res) => {
  var sending = {}
  var user = await UserModel.findOne({ username: req.params.uid })
  await MovieModel.findById(req.params.id, async (error, data) => {
    if (error) console.error(error)
    else {
      var userMovie = await user.movies.find(movie => {
        return movie.movie_id == req.params.id
      })

      console.log(userMovie)

      if (userMovie != undefined) {
        sending = {
          genre: data.genre,
          live: data.live,
          cover: data.cover,
          link: data.link,
          summary: data.summary,
          title: data.title,
          rating: userMovie.rating,
          favorite: userMovie.favorite,
          _id: data._id,
          __v: data.__v
        }
        res.json(sending)
      } else {
        await MovieModel.findById(req.params.id, async (error, data) => {
          if (error) console.error(error)
          else {
            sending = {
              genre: data.genre,
              live: data.live,
              cover: data.cover,
              link: data.link,
              summary: data.summary,
              title: data.title,
              rating: null,
              favorite: false,
              _id: data._id,
              __v: data.__v
            }
            movie = {
              movie_id: data._id,
              rating: null,
              favorite: false
            }
            var user = await UserModel.findOne({ username: req.params.uid })
            user.movies.push(movie)
            await user.save()
            res.json(sending)
          }
        })
      }
    }
  })
})
router.get('/:uid/media/movies/:id/add', async (req, res) => {
  var movie
  await MovieModel.findById(req.params.id, (error, data) => {
    if (error) console.error(error)
    else {
      movie = {
        movie_id: data._id,
        rating: null,
        favorite: false
      }
    }
  })
  var user = await UserModel.findOne({ username: req.params.uid })
  user.movies.push(movie)
  user.save(() => {
    console.log(movie)
    console.log(user)
    res.end()
  })
})
router.post('/:uid/media/movies/:id/update', async (req, res) => {
  var user = await UserModel.findOne({ username: req.params.uid })

  var subdocId
  user.movies.forEach(async movie => {
    if (movie.movie_id == req.params.id) subdocId = movie._id
  })

  var movie = user.movies.id(subdocId)
  movie.$set({
    movie_id: req.params.id,
    rating: req.body.rating,
    favorite: req.body.favorite
  })
  var saved = await user.save()
  res.json(saved)
})

// -- Music
router.get('/:uid/media/music/:id/get', async (req, res) => {
  var sending = {}
  var user = await UserModel.findOne({ username: req.params.uid })
  await MusicModel.findById(req.params.id, async (error, data) => {
    if (error) console.error(error)
    else {
      var userMusic = await user.music.find(item => {
        return item.music_id == req.params.id
      })

      if (userMusic != undefined) {
        sending = {
          artist: data.artist,
          genre: data.genre,
          live: data.live,
          cover: data.cover,
          songs: data.songs,
          summary: data.summary,
          title: data.title,
          rating: userMusic.rating,
          favorite: userMusic.favorite,
          _id: data._id,
          __v: data.__v
        }
        res.json(sending)
      } else {
        await MusicModel.findById(req.params.id, async (error, data) => {
          if (error) console.error(error)
          else {
            sending = {
              artist: data.artist,
              genre: data.genre,
              live: data.live,
              cover: data.cover,
              songs: data.songs,
              summary: data.summary,
              title: data.title,
              rating: null,
              favorite: false,
              _id: data._id,
              __v: data.__v
            }
            music = {
              music_id: data._id,
              rating: null,
              favorite: false
            }
            var user = await UserModel.findOne({ username: req.params.uid })
            user.music.push(music)
            await user.save()
            res.json(sending)
          }
        })
      }
    }
  })
})
router.get('/:uid/media/music/:id/add', async (req, res) => {
  var music
  await MusicModel.findById(req.params.id, (error, data) => {
    if (error) console.error(error)
    else {
      music = {
        music_id: data._id,
        rating: null,
        favorite: false
      }
    }
  })
  var user = await UserModel.findOne({ username: req.params.uid })
  user.music.push(music)
  user.save(() => {
    console.log(music)
    console.log(user)
    res.end()
  })
})
router.post('/:uid/media/music/:id/update', async (req, res) => {
  var user = await UserModel.findOne({ username: req.params.uid })

  var subdocId
  user.music.forEach(async music => {
    if (music.music_id == req.params.id) subdocId = music._id
  })

  var music = user.music.id(subdocId)
  music.$set({
    music_id: req.params.id,
    rating: req.body.rating,
    favorite: req.body.favorite
  })
  var saved = await user.save()
  res.json(saved)
})

module.exports = router