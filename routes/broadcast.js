const express = require('express')
const formidable = require('formidable')
const fs = require('fs')
const router = express.Router()

const UserModel = require('../models/User.js')

router.post('/:uid/create', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  User.posts.unshift(req.body)
  await User.save()
  res.json({
    posts: User.posts,
    post_id: User.posts[0]._id
  })
})

router.post('/:uid/file/:post', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var file

  const form = formidable({ multiples: false, uploadDir: __dirname + '/../files/broadcast/' + User._id, keepExtensions: true })

  await form.parse(req, async (error, fields, files) => {
    if (error) console.error(error)
    
    file = files.file
    await fs.renameSync(file.path, __dirname + '/../files/broadcast/' + User._id + '/' + file.name)
    res.json({ done: true })
  })
})

router.put('/:uid/:post', async (req, res) => {
  const User = await UserModel.findOne({ _id: req.params.uid })
  const OldPost = await User.posts.id(req.params.post)

  if (OldPost.file_path != req.body.file_path) await fs.unlinkSync(__dirname + '/../files/broadcast/' + User._id + '/' + OldPost.file_path)
  await UserModel.findOneAndUpdate({ _id: req.params.uid, 'posts._id': req.params.post }, { $set: { 'posts.$.content': req.body.content, 'posts.$.file_path': req.body.file_path, 'posts.$.file_type': req.body.file_type } })

  res.json({
    posts: await UserModel.findOne({ _id: req.params.uid }).posts,
    post: req.body
  })
})

router.put('/:uid/file/:post', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  const OldPost = await User.posts.id(req.params.post)
  var file

  const form = formidable({ multiples: false, uploadDir: __dirname + '/../files/broadcast/' + User._id, keepExtensions: true })

  await form.parse(req, async (error, fields, files) => {
    if (error) console.error(error)
    
    file = files.file
    await fs.renameSync(file.path, __dirname + '/../files/broadcast/' + User._id + '/' + file.name)
    res.json({ done: true })
  })
})

router.get('/:uid/delete/:id', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var Index = await User.posts.findIndex(post => { return post._id == req.params.id })
  if (User.posts[Index].file_path) await fs.unlinkSync(__dirname + '/../files/broadcast/' + User._id + '/' + User.posts[Index].file_path)
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
    user: await UserModel.findOne({ _id: req.params.uid }),
    profile: await UserModel.findOne({ _id: req.params.profile })
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
    user: await UserModel.findOne({ _id: req.params.uid }),
    profile: await UserModel.findOne({ _id: req.params.profile })
  })
})

module.exports = router