const express = require('express')
const router = express.Router()
const axios = require('axios')

const UserModel = require('../models/User.js')

router.get('/:url', (req, res) => {
  console.log(req.params.url)
  axios.get(decodeURIComponent(req.params.url)).then(response => res.send(response.data))
})

module.exports = router