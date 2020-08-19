const express = require('express')
const router = express.Router()

const BugModel = require('../models/Bug.js')

router.post('/:uid', async (req, res) => {
  var bug = req.body
  bug.uid = req.params.uid
  bug.fixed = false
  await BugModel.create(bug)
  res.end()
})

router.get('/', async (req, res) => {
  const bugs = await BugModel.find({})
  res.json(bugs)
})

router.put('/:id', async (req, res) => {
  await BugModel.findOneAndUpdate({ _id: req.params.id }, { $set: { fixed: true } })
  
  const Bugs = await BugModel.find({})
  res.json(Bugs)
})

router.get('/:id', async (req, res) => {
  await BugModel.findOneAndUpdate({ _id: req.params.id }, { $set: { fixed: false } })
  
  const Bugs = await BugModel.find({})
  res.json(Bugs)
})

router.delete('/:id', async (req, res) => {
  await BugModel.findOneAndDelete({ _id: req.params.id })
  
  const Bugs = await BugModel.find({})
  res.json(Bugs)
})

module.exports = router