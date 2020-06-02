const UserModel = require('../models/User.js')
const DMModel = require('../models/DM.js')

module.exports = io => {
  DMModel.find({}, (error, data) => {
    data.forEach(chat => {
      var namespace = io.of(`/transmission/${chat._id}`).on('connection', async socket => {
        console.log('Transmission client connected')
        var clients = []
        socket.on('handshake', data => {
          clients.push(data)
          console.log('Transmission client handshake confirmed', clients.length)
          if (clients.length == 2) namespace.emit('start', clients)
          console.log(clients)
        })
      })
    })
  })
}