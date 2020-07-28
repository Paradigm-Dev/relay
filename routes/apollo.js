const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const ApolloModel = require('../models/Apollo.js')
const UserModel = require('../models/User.js')

// Verify code
router.put('/', (req, res) => {
  ApolloModel.findOne({ code: req.body.code }, (error, data) => {
    if (error || data === null) res.json({ used: null })
    else res.json({ used: data.used })
  })
})

router.get('/:uid/list', (req, res) => {
  ApolloModel.find({ dev: req.params.uid }, (error, data) => {
    if (error) {
      console.error(error)
      res.json({ error })
    } else {
      res.json(data)
    }
  })
})

router.post('/:uid', async (req, res) => {
  let code = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let charactersLength = characters.length
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * charactersLength))
    if (code.length == 4) code += '-'
  }
  
  await ApolloModel.create({
    _id: mongoose.Types.ObjectId(),
    code,
    username: '',
    uid: '',
    name: req.body.name,
    dev: req.params.uid,
    used: false
  })

  UserModel.findOneAndUpdate({ _id: req.params.uid }, { $inc: { 'apollo_codes.created': 1 } }, (error, doc) => {
    if (error) console.error(error)
  })

  ApolloModel.find({ dev: req.params.uid }, (error, data) => {
    if (error) {
      console.error(error)
      res.json({ error })
    } else {
      res.json(data)
    }
  })
})

module.exports = router