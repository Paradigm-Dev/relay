const ConfigModel = require('../models/Config.js')
const UserModel = require('../models/User.js')
const moment = require('moment')

let connections = []
module.exports = { socket: (io) => {

  io.on('connection', async socket => {
    console.log('\x1b[32m', '[ SOCKET ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS'), '\x1b[34m', socket.id, '\x1b[0m', 'connected')

    var Config = await ConfigModel.find({})
    socket.emit('config', Config[0])
    setInterval(async () => {
      var newConfig = await ConfigModel.find({})
      if (newConfig != Config) {
        Config = newConfig
        socket.emit('config', Config[0])
      }
    }, 2000)

    socket.on('login', async data => {
      data.socket = socket
      connections.push(data)
      var User = await UserModel.findOne({ username: data.username })
      User.in = true
      await User.save()
      console.log('\x1b[32m', '[  AUTH  ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS'), '\x1b[34m', data.username, '\x1b[0m', 'logged in')
      setInterval(async () => {
        var newUser = await UserModel.findOne({ username: data.username })
        if (newUser != User) {
          User = newUser
          User.pic = `https://www.theparadigmdev.com/relay/profile-pics/${newUser._id}.jpg`
          socket.emit('user', User)
        }
      }, 2000)
    })

    socket.on('logout', async data => {
      var User = await UserModel.findOne({ username: data.username })
      var index = connections.findIndex(connection => {
        return connection.username == User.username
      })
      connections.splice(index, 1)
      User.in = false
      await User.save()
      console.log('\x1b[32m', '[  AUTH  ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS'), '\x1b[34m', data.username, '\x1b[0m', 'logged out')
      socket.emit('logout')
    })

    socket.on('list', async query => {
      var data = []
      for (var i = 0; i < connections.length; i++) {
        data.push({
          username: connections[i].username,
          socket: connections[i].socket.id
        })
      }
      socket.emit('list', data)
    })

    socket.on('disconnect', async () => {
      var index = await connections.findIndex(connection => {
        return connection.socket.id == socket.id
      })
      if (index > -1) {
        var data = connections[index]
        connections.splice(index, 1)
        var User = await UserModel.findOne({ username: data.username })
        User.in = false
        await User.save()
      }
      console.log('\x1b[32m', '[ SOCKET ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS'), '\x1b[34m', socket.id, '\x1b[0m', 'disconnected')
    })

    socket.on('new_chatroom', () => {
      require('./flamechat.js')(io)
    })

    socket.on('kick', user => io.emit('kick', user))

    socket.on('transmit_begin', data => {
      var to_index = connections.findIndex(connection => {
        return connection._id == data.to
      })

      connections[to_index].socket.emit('transmit_received', data)
    })
  })
}, connections }