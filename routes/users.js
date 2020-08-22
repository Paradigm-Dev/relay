const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const _path = require('path')
const formidable = require('formidable')
const fs = require('fs')
const moment = require('moment')
const Jimp = require('jimp')

const UserModel = require('../models/User.js')
const ApolloModel = require('../models/Apollo.js')
const ChatroomModel = require('../models/Chatroom.js')
const DMModel = require('../models/DM.js')
const BookModel = require('../models/Book.js')
const MovieModel = require('../models/Movie.js')
const MusicModel = require('../models/Music.js')
const BugModel = require('../models/Bug.js')

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

      ApolloModel.findOneAndUpdate({ code: req.body.code }, { $set: { used: true, username: newUser.username, uid: newUser._id } })

      fs.mkdirSync('/mnt/drawer/' + newUser._id)
      fs.mkdirSync(__dirname + '/../broadcast/' + newUser._id)

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
      res.json({ msg: 'The username and password do not match an account.' })
    }
    if (!err && user) {
      user.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + user._id + '.jpg'
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

  if (req.body.username) user.username = req.body.username
  if (req.body.bio) user.bio = req.body.bio
  if (req.body.color) user.color = req.body.color

  await user.save()

  // var people_to_update = []
  user.people.sent.forEach(async person => {
    var Person = await UserModel.findOne({ _id: person._id })
    var Index = Person.people.requests.findIndex(request => { return request._id == user._id })
    Person.people.requests[Index].username = req.body.username
    Person.people.requests[Index]._id = user._id
    Person.people.requests[Index].color = req.body.color
    await Person.save()
  })

  user.people.requests.forEach(async person => {
    var Person = await UserModel.findOne({ _id: person._id })
    var Index = Person.people.sent.findIndex(request => { return request._id == user._id })
    Person.people.sent[Index].username = req.body.username
    Person.people.sent[Index]._id = user._id
    Person.people.sent[Index].color = req.body.color
    await Person.save()
  })

  // await UserModel.updateMany({ 'people.approved.uid': user._id }, { $set: { 'people.approved.$.username':  } })

  user.people.approved.forEach(async person => {
    var Person = await UserModel.findOne({ _id: person._id })
    var Index = Person.people.approved.findIndex(request => { return request._id == user._id })
    Person.people.approved[Index].username = req.body.username
    Person.people.approved[Index]._id = user._id
    Person.people.approved[Index].color = req.body.color
    await Person.save()
    var DM = await DMModel.findOne({ _id: user.people.approved[Index].dm })
    var DM_index = DM.people.findIndex(person => { return person._id == user._id })
    DM.people[DM_index].username = req.body.username
    DM.people[DM_index].color = req.body.color
    DM.save()
  })

  ApolloModel.findOneAndUpdate({ uid: req.params.uid }, { $set: { username: req.body.username } })
  BugModel.updateMany({ uid: req.params.uid }, { $set: { username: req.body.username } })

  // user.people.requests.forEach(person => people_to_update.push(person._id))
  user.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + user._id + '.jpg'

  res.json(user)
})

router.get('/check/:u', async (req, res) => {
  var data = {
    exists: false,
    in: false
  }
  var User = await UserModel.findOne({ username: req.params.u })
  if (User) {
    data.exists = true
    if (User.in) data.in = true
    else data.in = false
  } else data.exists = false
  res.json(data)
})

router.get('/list', async (req, res) => {
  var People = await UserModel.find({})
  var filtered = []
  People.forEach(person => {
    filtered.push({
      username: person.username,
      color: person.color,
      in: person.in,
      bio: person.bio,
      pic: 'https://www.theparadigmdev.com/relay/profile-pics/' + person._id + '.jpg',
      _id: person._id,
      posts: person.posts
    })
  })
  res.json(filtered)
})

router.get('/shortlist', async (req, res) => {
  var People = await UserModel.find({})
  var filtered = []
  People.forEach(person => {
    filtered.push({
      _id: person._id,
      username: person.username,
      in: person.in,
      color: person.color
    })
  })
  res.json(filtered)
})

router.get('/:uid/info', async (req, res) => {
  var Person = await UserModel.findOne({ _id: req.params.uid })
  if (Person) {
    var data = {
      username: Person.username,
      color: Person.color,
      in: Person.in,
      bio: Person.bio,
      pic: 'https://www.theparadigmdev.com/relay/profile-pics/' + Person._id + '.jpg',
      _id: Person._id
    }
    res.json(data)
  } else res.json({ error: 'This user does not exist' })
})


// Chatroom functions
router.get('/:uid/chatroom/:id/:func', async (req, res) => {
  switch (req.params.func) {
    case 'request':
      var Chatroom = await ChatroomModel.findOne({ id: req.params.id })
      var User = await UserModel.findOne({ _id: req.params.uid })

      var banned = false
      await Chatroom.people.banned.forEach(person => { console.log(person._id); if (req.params.user == person._id) banned = true; })
    
      if (!banned) {
        console.log('not banned')
        Chatroom.people.requested.push({
          _id: User._id,
          username: User.username,
          color: User.color,
          pic: `https://www.theparadigmdev.com/relay/profile-pics/${User._id}.jpg`
        })
        User.chatrooms.push({
          name: Chatroom.name,
          id: Chatroom.id,
          icon: Chatroom.icon,
          status: 'requested'
        })
        await Chatroom.save()
        await User.save()
        User.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + User._id + '.jpg'
        res.json(User)
      } else res.json({ error: 'banned' })
      break
    case 'leave':
      var User = await UserModel.findOne({ _id: req.params.uid })
      var Index = User.chatrooms.findIndex(chatroom => {
        return chatroom.id == req.params.id
      })
      User.chatrooms[Index].remove()
      await User.save()
      User.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + User._id + '.jpg'
      res.json(User)
      break
  }
})

// Add/remove moonrocks
router.get('/:uid/moonrocks/:diff', (req, res) => {
  UserModel.findOneAndUpdate({ _id: req.params.uid }, { $inc: { moonrocks: parseInt(req.params.diff) } }, (error, data) => {
    console.log(data)
    res.json(data)
  })
})

// Post profile pic
router.post('/:uid/pic', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var file

  const form = formidable({ multiples: false, uploadDir: __dirname + '/../files/profile-pics/', keepExtensions: true })

  await form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    
    file = files['files[0]']
    await Jimp.read(file.path).then(img => {
      return img
        .resize(Jimp.AUTO, 150)
        .quality(50)
        .write(__dirname + '/../files/profile-pics/' + User._id + '.jpg')
    }).catch(error => console.error(error))
    // await fs.renameSync(file.path, __dirname + '/../files/profile-pics/' + User._id + '.jpg')
    User.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + User._id + '.jpg'
    res.json(User)
  })
})

router.get('/:uid/delete', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
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
        fs.unlink(_path.join(__dirname + '/../files/profile-pics/' + User._id + '.jpg'), async error => {
          if (error) console.error(error)
          var User = await UserModel.findOne({ _id: req.params.uid })
          User.people.approved.forEach(async person => {
            var Person = await UserModel.findOne({ _id: person._id })
            var Index = await Person.people.approved.findIndex(request => { return request._id == user._id })
            await Person.people.approved.splice(Index, 1)
            await Person.save()
          })
          User.people.requests.forEach(async person => {
            var Person = await UserModel.findOne({ _id: person._id })
            var Index = await Person.people.sent.findIndex(request => { return request._id == user._id })
            await Person.people.approved.splice(Index, 1)
            await Person.save()
          })
          User.people.sent.forEach(async person => {
            var Person = await UserModel.findOne({ _id: person._id })
            var Index = await Person.people.requests.findIndex(request => { return request._id == user._id })
            await Person.people.approved.splice(Index, 1)
            await Person.save()
          })
          await ApolloModel.findOneAndDelete({ uid: req.params.uid })
          await UserModel.findOneAndDelete({ _id: req.params.uid })
          res.end()
        })
      })
    })
  }
  deleteFolderRecursive('/mnt/drawer/' + User._id)
  deleteFolderRecursive(__dirname + '/../files/broadcast/' + User._id)
})


// Media
// -- Books
router.get('/:uid/media/books/:id/get', async (req, res) => {
  var sending = {}
  var user = await UserModel.findOne({ _id: req.params.uid })
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
            var user = await UserModel.findOne({ _id: req.params.uid })
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
  var user = await UserModel.findOne({ _id: req.params.uid })
  user.books.push(book)
  user.save(() => {
    console.log(book)
    console.log(user)
    res.end()
  })
})
router.post('/:uid/media/books/:id/update', async (req, res) => {
  var user = await UserModel.findOne({ _id: req.params.uid })

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
  var user = await UserModel.findOne({ _id: req.params.uid })
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
            var user = await UserModel.findOne({ _id: req.params.uid })
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
  var user = await UserModel.findOne({ _id: req.params.uid })
  user.movies.push(movie)
  user.save(() => {
    console.log(movie)
    console.log(user)
    res.end()
  })
})
router.post('/:uid/media/movies/:id/update', async (req, res) => {
  var user = await UserModel.findOne({ _id: req.params.uid })

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
  var user = await UserModel.findOne({ _id: req.params.uid })
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
            var user = await UserModel.findOne({ _id: req.params.uid })
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
  var user = await UserModel.findOne({ _id: req.params.uid })
  user.music.push(music)
  user.save(() => {
    console.log(music)
    console.log(user)
    res.end()
  })
})
router.post('/:uid/media/music/:id/update', async (req, res) => {
  var user = await UserModel.findOne({ _id: req.params.uid })

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

router.get('/:uid/people/send/:user', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var Person = await UserModel.findOne({ _id: req.params.user })
  await User.people.sent.push({
    _id: req.params.user,
    username: Person.username,
    color: Person.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${Person._id}.jpg`,
    dm: ''
  })
  await User.save()
  await Person.people.requests.push({
    _id: req.params.uid,
    username: User.username,
    color: User.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${User._id}.jpg`,
    dm: ''
  })
  await Person.save()
  res.json(User.people)
})

router.get('/:uid/people/request/:user/approve', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var Person = await UserModel.findOne({ _id: req.params.user })

  var User_I = await User.people.requests.findIndex(person => { return person._id == req.params.user })
  var Person_I = await Person.people.sent.findIndex(person => { return person._id == req.params.uid })

  await User.people.requests[User_I].remove()
  await Person.people.sent[Person_I].remove()

  var new_dm = await DMModel.create({
    messages: [],
    people: [
      {
        _id: User._id,
        username: User.username,
        color: User.color,
        pic: `https://www.theparadigmdev.com/relay/profile-pics/${User._id}.jpg`
      },
      {
        _id: Person._id,
        username: Person.username,
        color: Person.color,
        pic: `https://www.theparadigmdev.com/relay/profile-pics/${Person._id}.jpg`
      }
    ]
  })

  await fs.mkdirSync(__dirname + `/../files/flamechat/dm/${new_dm._id}`)

  await User.people.approved.push({
    _id: req.params.user,
    username: Person.username,
    color: Person.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${Person._id}.jpg`,
    dm: new_dm._id
  })
  await Person.people.approved.push({
    _id: req.params.uid,
    username: User.username,
    color: User.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${User._id}.jpg`,
    dm: new_dm._id
  })

  await User.save()
  await Person.save()

  res.json(User.people)
})

router.get('/:uid/people/request/:user/decline', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var Person = await UserModel.findOne({ _id: req.params.user })

  var User_I = await User.people.requests.findIndex(person => { return person._id == req.params.user })
  var Person_I = await Person.people.sent.findIndex(person => { return person._id == req.params.uid })

  await User.people.requests[User_I].remove()
  await Person.people.sent[Person_I].remove()

  await User.save()
  await Person.save()

  res.json(User.people)
})

router.get('/:uid/people/request/:user/retract', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var Person = await UserModel.findOne({ _id: req.params.user })

  var User_I = await User.people.sent.findIndex(person => { return person._id == req.params.user })
  var Person_I = await Person.people.requests.findIndex(person => { return person._id == req.params.uid })

  await User.people.sent[User_I].remove()
  await Person.people.requests[Person_I].remove()

  await User.save()
  await Person.save()

  res.json(User.people)
})

router.get('/:uid/people/remove/:user', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var Person = await UserModel.findOne({ _id: req.params.user })

  var User_I = await User.people.approved.findIndex(person => { return person._id == req.params.user })
  var Person_I = await Person.people.approved.findIndex(person => { return person._id == req.params.uid })

  User.people.approved[User_I].liked_posts.forEach(post => Person.posts.id(post).likes--)
  Person.people.approved[Person_I].liked_posts.forEach(post => User.posts.id(post).likes--)

  await DMModel.findOneAndDelete({ _id: User.people.approved[User_I].dm })
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
    })
  }
  await deleteFolderRecursive(__dirname + `/../files/flamechat/dm/${User.people.approved[User_I].dm}`)

  await User.people.approved[User_I].remove()
  await Person.people.approved[Person_I].remove()

  await User.save()
  await Person.save()

  res.json({
    user: User,
    profile: Person
  })
})

router.get('/:uid/people/block/:user', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var Person = await UserModel.findOne({ _id: req.params.user })

  await User.people.blocked.push({
    _id: req.params.user,
    username: Person.username,
    color: Person.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${Person._id}.jpg`,
    dm: ''
  })
  await Person.people.blocked_by.push(req.params.uid)

  await User.save()
  await Person.save()

  res.json(User.people)
})

router.get('/:uid/people/unblock/:user', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var Person = await UserModel.findOne({ _id: req.params.user })

  var User_I = await User.people.blocked.findIndex(person => { return person._id == req.params.user })
  var Person_I = await Person.people.blocked_by.findIndex(person => { return person == req.params.uid })

  await User.people.blocked[User_I].remove()
  await Person.people.blocked_by.splice(Person_I, 1)

  await User.save()
  await Person.save()

  res.json(User.people)
})

module.exports = router