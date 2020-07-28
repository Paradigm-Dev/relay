const express = require('express')
const fs = require('fs')
const router = express.Router()

const SupporterModel = require('../models/Supporter.js')

router.get('/crater.css', (req, res) => {
  fs.readFile(__dirname + '/../files/crater.css', (error, data) => {
    if (error) console.error(error)
    res.send(data)
  })
})

module.exports = router