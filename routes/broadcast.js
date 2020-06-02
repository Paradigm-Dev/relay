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
  var User = await UserModel.findOneAndUpdate({ _id: req.params.uid, 'people.approved._id': req.params.profile }, { $push: { 'people.approved.$.liked_posts': req.params.post } })
  var Profile = await UserModel.findOneAndUpdate({ _id: req.params.profile, 'posts._id': req.params.post }, { $inc: { 'posts.$.likes': 1 } })
  User.pic = `https://www.theparadigmdev.com/relay/profile-pics/${User._id}.jpg`
  Profile.pic = `https://www.theparadigmdev.com/relay/profile-pics/${Profile._id}.jpg`
  res.json({
    user: User,
    profile: Profile
  })
})

router.get('/:uid/unlike/:profile/:post', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var u_index = await User.people.approved.findIndex(person => { return person._id == req.params.profile })
  var post_index = await User.people.approved[u_index].liked_posts.findIndex(post => { return post._id == req.params.post })
  await User.people.approved[u_index].liked_posts.splice(post_index, 1)
  await User.save()
  var Profile = await UserModel.findOneAndUpdate({ _id: req.params.profile, 'posts._id': req.params.post }, { $inc: { 'posts.$.likes': -1 } })
  User.pic = `https://www.theparadigmdev.com/relay/profile-pics/${User._id}.jpg`
  Profile.pic = `https://www.theparadigmdev.com/relay/profile-pics/${Profile._id}.jpg`
  res.json({
    user: User,
    profile: Profile
  })
})

module.exports = router