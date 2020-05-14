const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const moment = require('moment')
const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')

const UserModel = require('../models/User.js')

firebase.initializeApp({
  apiKey: "AIzaSyCQqPjLsa4fKf82dQ6V1iMxFlKgmDurnBA",
  authDomain: "paradigm-a1bc9.firebaseapp.com",
  databaseURL: "https://paradigm-a1bc9.firebaseio.com",
  projectId: "paradigm-a1bc9",
  appId: "1:728943503114:web:4ea6a4f7b7f57e71"
})

router.get('/check/:u', (req, res) => {
  firebase.firestore().collection('users').doc(req.params.u).get().then(doc => {
    res.json({ exists: doc.exists })
  })
})

router.post('/', (req, res) => {
  firebase.auth().signInWithEmailAndPassword(req.body.username + '@theparadigmdev.com', req.body.password).then(() => {
    var newUser = {}
    firebase.firestore().collection('users').doc(req.body.username).get().then(doc => {
      var data = doc.data()
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) throw err
          else {
            newUser.password = hash
            newUser.username = req.body.username
            newUser.bio = data.bio
            newUser.color = data.color
            newUser.chatrooms = []
            data.chatrooms.forEach(chatroom => {
              newUser.chatrooms.push({
                name: chatroom.name,
                id: chatroom.id,
                icon: chatroom.icon
              })
            })
            newUser.rights = {
              admin: data.isAdmin,
              author: data.isWriter,
              asteroid: data.isAsteroid,
              patriot: false,
              developer: false
            }
            newUser.moonrocks = data.moonrocks
            newUser.books = []
            newUser.movies = []
            newUser.music = []
            newUser.strikes = 0
            newUser.banned = false
            newUser.in = false
            newUser.files = []
            newUser.created = moment().format('dddd, MMMM Do YYYY [at] h:mm a')
      
            UserModel.create(newUser, (error, doc) => {
              if (!error) {
                doc.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + doc._id + '.jpg'
                res.json(doc)
              } else {
                console.error(error)
                res.end()
              }
            })
          }
        })
      })
    })
  }).catch(error => console.error(error))
})

module.exports = router