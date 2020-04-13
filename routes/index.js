const express = require('express')
const fs = require('fs')
const router = express.Router()

// OTHER
router.get('/terminal', (req, res) => {
  fs.readFile(`../files/terminal.html`, (error, data) => {
    res.write(data)
  })
})
router.get('/terms', (req, res) => {
  fs.readFile(`../files/terms.html`, (error, data) => {
    res.write(data)
  })
})
router.get('/crater.css', (req, res) => {
  fs.readFile(__dirname + '/../files/crater.css', (error, data) => {
    if (error) console.error(error)
    res.send(data)
  })
})

module.exports = router