const shell = require('shelljs')
const ConfigModel = require('./../models/Config.js')
const UserModel = require('./../models/User.js')

module.exports = io => {
  var terminal = io.of('/terminal').on('connection', async socket => {
    socket.on('config', async data => {
      var newConfig = await ConfigModel.findOne({ find: 'this' })
      await newConfig.overwrite(data.config)
      await newConfig.save()
    })

    socket.on('ban', async data => {
      var User = await UserModel.findOne({ username: data.username })
      User.banned = data.value
      await User.save()
    })

    socket.on('rights.admin', async data => {
      var User = await UserModel.findOne({ username: data.username })
      User.rights.admin = data.value
      await User.save()
    })

    socket.on('rights.author', async data => {
      var User = await UserModel.findOne({ username: data.username })
      User.rights.author = data.value
      await User.save()
    })

    socket.on('rights.asteroid', async data => {
      var User = await UserModel.findOne({ username: data.username })
      User.rights.asteroid = data.value
      await User.save()
    })

    socket.on('kick', async username => {
      io.emit('kick', username)
    })

    socket.on('kill', async username => {
      io.emit('kill', username)
    })

    socket.on('mrocks', async data => {
      var User = await UserModel.findOne({ username: data.username })
      User.moonrocks += data.value
      User.save()
    })

    socket.on('nuke', async () => {
      await io.emit('nuke')
      shell.exec('sudo shutdown -h now')
    })
  })  
}