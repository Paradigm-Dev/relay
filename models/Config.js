const mongoose = require('mongoose')

const RouterConfigSchema = new mongoose.Schema({
  flamechat: Boolean,
  satellite: Boolean,
  paradox: Boolean,
  drawer: Boolean,
  media: Boolean,
  home: Boolean,
  corona: Boolean,
  write: Boolean,
  people: Boolean,
  broadcast: Boolean,
  transmission: Boolean
})

const ConfigSchema = new mongoose.Schema({
  sign_up: Boolean,
  migrate: Boolean,
  reset: Boolean,
  shutdown: Boolean,
  router: RouterConfigSchema,
  find: String,
  banned: [String]
}, { collection: 'config' })

const ConfigModel = mongoose.model('config', ConfigSchema)

module.exports = ConfigModel