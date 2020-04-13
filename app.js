const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const cors = require('cors')
const bodyParser = require('body-parser')
const socket = require('socket.io')
const https = require('https')
const fs = require('fs')
const moment = require('moment')
const expressDefend = require('express-defend')
const blacklist = require('express-blacklist')

const ConfigModel = require('./models/Config.js')
const UserModel = require('./models/User.js')

const port = 443
const host = '192.168.1.82'
const app = express()

const server = https.createServer({
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.pem')
  // key: fs.readFileSync('/etc/letsencrypt/live/www.theparadigmdev.com/privkey.pem'),
  // cert: fs.readFileSync('/etc/letsencrypt/live/www.theparadigmdev.com/fullchain.pem')
}, app).listen(port, host)
console.log('\x1b[32m', '[ SERVER ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS A'), '\x1b[34m', `https://${host}:${port}`, '\x1b[0m', 'listening')

const io = socket(server)

require('./sockets/flamechat.js')(io)
require('./sockets/terminal.js')(io)

mongoose.promise = global.Promise

app.use(blacklist.blockRequests('./blacklist.txt'))
app.use(expressDefend.protect({ 
  maxAttempts: 5,
  dropSuspiciousRequest: true,
  consoleLogging: true,
  logFile: './suspicious.log',
  onMaxAttemptsReached: async function(ipAddress, url){
    console.log('IP address ' + ipAddress + ' is considered to be malicious, URL: ' + url)
    await blacklist.addAddress(ipAddress)
  } 
}))

app.use(cors())

app.use(bodyParser.json())

require('./config/passport')(passport)

app.use(express.urlencoded({ extended: true }))

app.use(passport.initialize())

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
)

// ROVER
app.use('/rover', express.static(__dirname + '/rover'))

// PARADIGM
app.use('/', express.static(__dirname + '/paradigm'))

// RELAY
app.use('/relay', express.static(__dirname + '/files'))

// ROUTES
app.use('/users', require('./routes/users.js'))
app.use('/users/migrate', require('./routes/migrate.js'))
app.use('/flamechat', require('./routes/flamechat.js'))
app.use('/paradox', require('./routes/paradox.js'))
app.use('/media', require('./routes/media.js'))
app.use('/drawer', require('./routes/drawer.js'))
app.use('/terminal', require('./routes/terminal.js'))
app.use('/patriot', require('./routes/patriot.js'))
app.use('/', require('./routes/index.js'))

mongoose.connect('mongodb://192.168.1.82:27017/paradigm', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => console.log('\x1b[32m', '[   DB   ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS A'), '\x1b[34m', `mongodb://192.168.1.82:27017`, '\x1b[0m', 'connected')).catch(error => console.error(error))

var connections = []

io.on('connection', async socket => {
  console.log('\x1b[32m', '[ SOCKET ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS A'), '\x1b[34m', socket.id, '\x1b[0m', 'connected')

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
    data.socket = socket.id
    connections.push(data)
    var User = await UserModel.findOne({ username: data.username })
    User.in = true
    await User.save()
    console.log('\x1b[32m', '[  AUTH  ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS A'), '\x1b[34m', data.username, '\x1b[0m', 'logged in')
    setInterval(async () => {
      var newUser = await UserModel.findOne({ username: data.username })
      if (newUser != User) {
        User = newUser
        User.pic = `https://www.theparadigmdev.com/relay/profile-pics/${User.pic}`
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
    console.log('\x1b[32m', '[  AUTH  ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS A'), '\x1b[34m', data.username, '\x1b[0m', 'logged out')
    socket.emit('logout')
  })

  socket.on('list', async query => {
    var data = []
    connections.forEach(connection => {
      data.push({
        username: connection.username,
        socket: connection.socket
      })
    })
    socket.emit('list', data)
  })

  socket.on('disconnect', async () => {
    var index = await connections.findIndex(connection => {
      return connection.socket == socket.id
    })
    if (index > -1) {
      var data = connections[index]
      connections.splice(index, 1)
      var User = await UserModel.findOne({ username: data.username })
      User.in = false
      await User.save()
    }
    console.log('\x1b[32m', '[ SOCKET ]', '\x1b[31m', moment().format('MM/DD/YYYY, HH:MM:SS A'), '\x1b[34m', socket.id, '\x1b[0m', 'disconnected')
  })

  socket.on('new_chatroom', () => {
    require('./sockets/flamechat.js')(io)
  })
})
