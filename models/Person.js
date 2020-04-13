const mongoose = require('mongoose')

const PersonSchema = new mongoose.Schema({
  name: String,
  pic: String
}, { collection: 'people', strict: false })

const PersonModel = mongoose.model('person', PersonSchema)

module.exports = PersonModel