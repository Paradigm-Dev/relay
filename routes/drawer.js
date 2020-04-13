const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const moment = require('moment')

const UserModel = require('../models/User.js')

// router.get('/list/:username', (req, res) => {
//   UserModel.findOne({ username: req.params.username }, (error, data) => {
//     if (!error) res.json(data.files)
//   })
  // var dir = path.join(__dirname + '/../drawer/' + req.params.username)
  // if (fs.existsSync(dir)) {
  //   fs.readdir(dir, (error, filenames) => {
  //     if (error) {
  //       console.error(error)
  //     } else {
  //       res.json(filenames)
  //     }
  //   })
  // } else {
  //   fs.mkdirSync(dir)
  // }
// })

router.get('/:username/download/:id', async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.username })
  var File = await User.files.id(req.params.id)
  res.download(path.join(__dirname + '/../drawer/' + req.params.username + '/' + File.path))
})

router.post('/:username/rename/:id', async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.username })
  var File = await User.files.id(req.params.id)
  fs.rename(__dirname + '/../drawer/' + req.params.username + '/' + File.path, __dirname + '/../drawer/' + req.params.username + '/' + req.body.name + '.' +File.path.slice(File.path.lastIndexOf('.') + 1), (err) => {
    if (err) throw err;
  })
  var oldPath = File.path
  File.path = req.body.name + '.' + oldPath.slice(oldPath.lastIndexOf('.') + 1)
  File.name = req.body.name
  await User.save()
  res.end()
})

router.delete('/:username/delete/:id', async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.username })
  var File = await User.files.id(req.params.id)  
  fs.unlink(path.join(__dirname + '/../drawer/' + req.params.username + '/' + File.path), async error => {
    await File.remove()
    await User.save()
    res.end()
    if (error) throw error
  })
})

router.post('/:username/upload', (req, res) => {
  var form = new formidable.IncomingForm()

  form.parse(req)

  form.on('fileBegin', (name, file) => {
    var dir = path.join(__dirname + '/../drawer/' + req.params.username)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    file.path = __dirname + '/../drawer/' + req.params.username + '/' + file.name
  })

  form.on('file', async (name, file) => {
    var User = await UserModel.findOne({ username: req.params.username })
    User.files.push({
      name: file.name.slice(0, file.name.lastIndexOf('.')),
      type: file.type,
      size: file.size + ' B',
      date: moment().format('MM/DD/YYYY [at] HH:MM a'),
      path: file.name
    })
    await User.save()
    res.end()
  })
})

module.exports = router