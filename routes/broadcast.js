const express = require('express')
const router = express.Router()

const UserModel = require('../models/User.js')

router.post('/:uid/create', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  User.posts.unshift(req.body)
  await User.save()
  res.json(User.posts)
})

router.get('/:uid/delete/:id', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var Index = await User.posts.findIndex(post => { return post._id == req.params.id })
  console.log(Index)
  User.posts[Index].remove()
  await User.save()
  res.json(User.posts)
})

module.exports = router