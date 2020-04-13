const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
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
            newUser.pic = `${data.pic}.jpg`
            newUser.chatrooms = []
            data.chatrooms.forEach(chatroom => {
              newUser.chatrooms.push({
                name: chatroom.name,
                id: chatroom.id,
                icon: chatroom.icon
              })
            })
            newUser.friends = [],
            newUser.rights = {
              admin: data.isAdmin,
              author: data.isWriter,
              asteroid: data.isAsteroid
            }
            newUser.moonrocks = data.moonrocks
            newUser.books = []
            newUser.movies = []
            newUser.music = []
            newUser.strikes = 0
            newUser.banned = false
            newUser.in = false
            newUser.files = []
      
            UserModel.create(newUser, (error, doc) => {
              if (!error) {
                doc.pic = 'https://www.theparadigmdev.com/relay/profile-pics/' + doc.pic
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