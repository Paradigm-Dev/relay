const ChatroomModel = require('../models/Chatroom.js')
const DMModel = require('../models/DM.js')
const mongoose = require('mongoose')
const fs = require('fs')

module.exports = io => {
  ChatroomModel.find({}, (error, data) => {
    if (error) console.error(error)
    else {
      data.forEach(chatroom => {
        let typers = []
        var namespace = io.of(`/flamechat/${chatroom.id}`).on('connection', async socket => {
          var chatroom_id = chatroom.id
          var Chatroomed = await ChatroomModel.findOne({ id: chatroom_id })
          socket.emit('data', Chatroomed)
          socket.on('send', async data => {
            var data = data
            var Chatroom = await ChatroomModel.findOne({ id: chatroom_id })
            data._id = mongoose.Types.ObjectId()
            await Chatroom.messages.push(data)
            await Chatroom.save()
            namespace.emit('send', data)
          })
          socket.on('delete', async id => {
            var Chatroom = await ChatroomModel.findOne({ id: chatroom_id })
            var Message = await Chatroom.messages.id(id)
            if (Message.type == 'file') await fs.unlinkSync(__dirname + `/../files/flamechat/chatroom/${Chatroom.id}/${Message.content}`)
            await Message.remove()
            await Chatroom.save()
            namespace.emit('delete', id)
          })
          socket.on('kill', () => {
            namespace.emit('kill')
          })
          socket.on('people', async id => {
            var Chatroom = await ChatroomModel.findOne({ id: id })
            namespace.emit('people', Chatroom.people)
          })
          socket.on('edit', async data => {
            var Chatroom = await ChatroomModel.findOne({ id: chatroom_id })
            var MessageIndex = Chatroom.messages.findIndex(message => {
              return message._id == data._id
            })
            var Message = await Chatroom.messages.id(data._id)
            var oldID = Message._id
            var Data = {
              _id: mongoose.Types.ObjectId(),
              color: data.color,
              username: data.username,
              user_id: data.user_id,
              content: data.content,
              pic: data.pic,
              timestamp: data.timestamp,
              edits: data.edits + 1,
              type: data.type
            }
            Chatroom.messages[MessageIndex] = Data
            await Chatroom.save()
            Data.oldID = oldID
            namespace.emit('edit', Data)
          })
          socket.on('typing', async data => {
            let exists = false
            typers.forEach(typer => {
              if (typer.user == data.user) exists = true
            })
            if (exists && data.is === false) {
              const index = typers.findIndex(typer => {
                return typer == data.user
              })
              typers.splice(index, 1)
            }
            else if (!exists && data.is === true) {
              typers.splice(typers.length, 0, data)
            }
            namespace.emit('typing', typers)
          })
          socket.on('purge', () => namespace.emit('purge'))
        })
      })
    }
  })

  DMModel.find({}, (error, data) => {
    if (error) console.error(error)
    else {
      data.forEach(dm => {
        let typers = []
        var namespace = io.of(`/flamechat/${dm._id}`).on('connection', async socket => {
          var DMed = await DMModel.findOne({ _id: dm._id })
          socket.emit('data', DMed)
          socket.on('send', async data => {
            var data = data
            var dm_send = await DMModel.findOne({ _id: dm._id })
            data._id = mongoose.Types.ObjectId()
            await dm_send.messages.push(data)
            await dm_send.save()
            namespace.emit('send', data)
          })
          socket.on('delete', async id => {
            var dm_delete = await DMModel.findOne({ _id: dm._id })
            var Message = await dm_delete.messages.id(id)
            if (Message.type == 'file') await fs.unlinkSync(__dirname + `/../files/flamechat/dm/${dm._id}/${Message.content}`)
            await Message.remove()
            await dm_delete.save()
            namespace.emit('delete', id)
          })
          socket.on('kill', () => {
            namespace.emit('kill')
          })
          socket.on('edit', async data => {
            var dm_edit = await DMModel.findOne({ _id: dm._id })
            var MessageIndex = dm_edit.messages.findIndex(message => {
              return message._id == data._id
            })
            var Message = await dm_edit.messages.id(data._id)
            var oldID = Message._id
            var Data = {
              _id: mongoose.Types.ObjectId(),
              color: data.color,
              username: data.username,
              user_id: data.user_id,
              content: data.content,
              pic: data.pic,
              timestamp: data.timestamp,
              edits: data.edits + 1,
              type: data.type
            }
            dm_edit.messages[MessageIndex] = Data
            await dm_edit.save()
            Data.oldID = oldID
            namespace.emit('edit', Data)
          })
          socket.on('typing', async data => {
            let exists = false
            typers.forEach(typer => {
              if (typer.user == data.user) exists = true
            })
            if (exists && data.is === false) {
              const index = typers.findIndex(typer => {
                return typer == data.user
              })
              typers.splice(index, 1)
            }
            else if (!exists && data.is === true) {
              typers.splice(typers.length, 0, data)
            }
            namespace.emit('typing', typers)
          })
        })
      })
    }
  })
}