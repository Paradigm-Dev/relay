const express = require('express')
const router = express.Router()

const NewsModel = require('../models/News.js')

// Get news articles
router.get('/get', (req, res) => {
  NewsModel.find({}, (error, data) => {
    var articles = []

    data.forEach(article => {
      articles.push(article)
    })

    res.json(articles)
  })
})

router.post('/add', (req, res) => {
  NewsModel.create(req.body, (error, data) => {
    if (error) {
      console.error(error)
      res.end()
    } else {
      res.json(data)
    }
  })
})

module.exports = router