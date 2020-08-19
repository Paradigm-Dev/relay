const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const moment = require('moment')

const UserModel = require('../models/User.js')

router.get('/:uid/download/:id', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var File = await User.files.id(req.params.id)
  res.download(path.join('/mnt/drawer/' + req.params.uid + '/' + File.path))
})

router.get('/:uid/get/:id', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var File = await User.files.id(req.params.id)
  res.sendFile(path.join('/mnt/drawer/' + req.params.uid + '/' + File.path))
})

router.post('/:uid/rename/:id', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var File = await User.files.id(req.params.id)
  var newPath
  if (File.type == 'workshop/write') newPath = req.body.name + '.write.json'
  else newPath = req.body.name + '.' + File.path.slice(File.path.lastIndexOf('.') + 1)
  fs.rename('/mnt/drawer/' + req.params.uid + '/' + File.path, '/mnt/drawer/' + req.params.uid + '/' + newPath, (err) => {
    if (err) throw err;
  })
  File.path = newPath
  File.name = req.body.name
  await User.save()
  res.end()
})

router.delete('/:uid/delete/:id', async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid })
  var File = await User.files.id(req.params.id)  
  fs.unlink(path.join('/mnt/drawer/' + req.params.uid + '/' + File.path), async error => {
    await File.remove()
    await User.save()
    res.json(User)
    if (error) throw error
  })
})

router.post('/:uid/upload/write', (req, res) => {
  const pathway = `/mnt/drawer/${req.params._uid}/${req.body.title}.write.json`
  if (fs.existsSync(pathway)) fs.unlinkSync(pathway)
  fs.writeFile(pathway, JSON.stringify(req.body), error => {
    if (error) console.error(error)
    fs.stat(pathway, async (error, stats) => {
      if (error) console.error(error)
      var User = await UserModel.findOne({ _id: req.params.uid })
      let exists = false
      User.files.forEach(file => {
        if (file.name == req.body.title) exists = true
      })
      if (!exists) User.files.push({
        name: req.body.title,
        type: 'workshop/write',
        size: stats.size + ' B',
        date: moment().format('MM/DD/YYYY [at] h:mm a'),
        path: `${req.body.title}.write.json`
      })
      await User.save()
      res.json(req.body)
    })
  })
})

router.post('/:uid/upload/sales', (req, res) => {
  const pathway = `/mnt/drawer/${req.params.uid}/${req.body.title}.sales.json`
  if (fs.existsSync(pathway)) fs.unlinkSync(pathway)
  fs.writeFile(pathway, JSON.stringify(req.body), error => {
    if (error) console.error(error)
    fs.stat(pathway, async (error, stats) => {
      if (error) console.error(error)
      var User = await UserModel.findOne({ _id: req.params.uid })
      let exists = false
      User.files.forEach(file => {
        if (file.name == req.body.title) exists = true
      })
      if (!exists) User.files.push({
        name: req.body.title,
        type: 'workshop/sales',
        size: stats.size + ' B',
        date: moment().format('MM/DD/YYYY [at] h:mm a'),
        path: `${req.body.title}.sales.json`
      })
      await User.save()
      res.json(req.body)
      
    })
  })
})

router.post('/:uid/upload', async (req, res) => {
  const form = formidable({ multiples: true, uploadDir: `/mnt/drawer/${req.params.uid}`, keepExtensions: true, maxFileSize: 100 * 1024 * 1024 * 1024 })

  await form.parse(req, async (error, fields, files) => {
    if (error) {
      console.error(error)
      res.end()
    } else {
      var User = await UserModel.findOne({ _id: req.params.uid })
      Object.keys(files).forEach(i => {
        User.files.push({
          name: files[i].name.slice(0, files[i].name.lastIndexOf('.')),
          type: files[i].type,
          size: files[i].size + ' B',
          date: moment().format('MM/DD/YYYY [at] h:mm a'),
          path: files[i].name
        })
        fs.rename(files[i].path, `/mnt/drawer/${req.params.uid}/${files[i].name}`, () => {})
      })
      await User.save()
      res.json(User)
    }
  })
})

module.exports = router