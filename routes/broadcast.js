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
  User.posts[Index].remove()
  await User.save()
  res.json(User.posts)
})

router.get('/:uid/like/:profile/:post', async (req, res) => {
  await UserModel.findOneAndUpdate({ _id: req.params.uid, 'people.approved._id': req.params.profile }, { $push: { 'people.approved.$.liked_posts': req.params.post } })
  var Profile = await UserModel.findOneAndUpdate({ _id: req.params.profile, 'posts._id': req.params.post }, { $inc: { 'posts.$.likes': 1 } })
  Profile.pic = `https://www.theparadigmdev.com/relay/profile-pics/${Profile._id}.jpg`
  res.json(Profile)
})

module.exports = router