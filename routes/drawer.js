const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const moment = require('moment')

const UserModel = require('../models/User.js')

router.get('/:username/list', (req, res) => {
  UserModel.findOne({ username: req.params.username }, (error, data) => {
    if (!error) res.json(data.files)
  })
})

router.get('/:username/download/:id', async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.username })
  var File = await User.files.id(req.params.id)
  res.download(path.join(__dirname + '/../drawer/' + req.params.username + '/' + File.path))
})

router.get('/:username/get/:id', async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.username })
  var File = await User.files.id(req.params.id)
  res.sendFile(path.join(__dirname + '/../drawer/' + req.params.username + '/' + File.path))
})

router.post('/:username/rename/:id', async (req, res) => {
  var User = await UserModel.findOne({ username: req.params.username })
  var File = await User.files.id(req.params.id)
  var newPath
  if (File.type == 'workshop/write') newPath = req.body.name + '.write.json'
  else newPath = req.body.name + '.' + File.path.slice(File.path.lastIndexOf('.') + 1)
  fs.rename(__dirname + '/../drawer/' + req.params.username + '/' + File.path, __dirname + '/../drawer/' + req.params.username + '/' + newPath, (err) => {
    if (err) throw err;
  })
  File.path = newPath
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

router.post('/:username/upload/write', (req, res) => {
  console.log('Saving new Write file...')
  const pathway = __dirname + `/../drawer/${req.params.username}/${req.body.title}.write.json`
  if (fs.existsSync(pathway)) fs.unlinkSync(pathway)
  fs.writeFile(pathway, JSON.stringify(req.body), error => {
    if (error) console.error(error)
    console.log('The file has been saved!')
    fs.stat(pathway, async (error, stats) => {
      if (error) console.error(error)
      var User = await UserModel.findOne({ username: req.params.username })
      let exists = false
      User.files.forEach(file => {
        if (file.name == req.body.title) exists = true
      })
      if (!exists) User.files.push({
        name: req.body.title,
        type: 'workshop/write',
        size: stats.size + 'B',
        date: moment().format('MM/DD/YYYY [at] HH:MM a'),
        path: `${req.body.title}.write.json`
      })
      await User.save()
      res.json(req.body)
    })
  })
})

router.post('/:username/upload', (req, res) => {
  var form = new formidable.IncomingForm()

  form.parse(req)

  form.on('fileBegin', (name, file) => {
    var dir = path.join(__dirname + '/../drawer/' + req.params.username)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    file.path = __dirname + '/../drawer/' + req.params.username + '/' + file.name
    if (fs.existsSync(file.path)) {
      form.pause()
      res.end()
    }
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