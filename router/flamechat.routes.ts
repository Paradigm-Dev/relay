// @deno-types='https://deno.land/x/oak/types.d.ts'
import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { Chatroom, Person } from '../interfaces/Chatroom.interface.ts'
import { User, StoredChatroom } from '../interfaces/User.interface.ts'
const chatrooms = db.collection<Chatroom>('chatrooms')
const users = db.collection<User>('users')

import parseBody from '../helpers/parseBody.ts'
import generateObjectId from '../helpers/generateObjectId.ts'

import { upload } from 'https://deno.land/x/upload_middleware_for_oak_framework/mod.ts'

router.post('/api/:uid/flamechat/chatroom', async context => {
  const body = await parseBody(context)
  let user = await users.findOne({ _id: { $oid: context.params.uid } })

  const _id = generateObjectId()
  if (context.params.uid) {

    const newChatroom: Chatroom = {
      _id,
      icon: body.icon,
      id: body.id,
      name: body.name,
      owner: body.owner,
      owner_id: context.params.uid,
      theme: body.theme,
      messages: [],
      people: {
        approved: [
          {
            _id: user._id.$oid,
            username: user.username,
            color: user.color,
            pic: `https://www.theparadigmdev.com/relay/profile-pics/${user._id.$oid}.jpg`
          }
        ],
        requested: [],
        banned: []
      }
    }
    const chatroom = await chatrooms.insertOne(newChatroom)
  
    const storedChatroom: StoredChatroom = {
      name: chatroom.name,
      id: chatroom.id,
      icon: chatroom.icon,
      status: 'approved'
    }
    await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { chatrooms: storedChatroom } })
    await Deno.mkdir(`${Deno.cwd()}/files/flamechat/chatroom/${body.id}`)
    
    context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
    context.response.type = 'application/json'
  }
})

router.post('/api/:uid/flamechat/chatroom/:id/file', upload('/temp'), async context => {
  await Deno.rename(context.uploadedFiles.file.uri, `${Deno.cwd()}/files/flamechat/chatroom/${context.params.id}/${context.uploadedFiles.file.filename}`)
})

router.post('/api/:uid/flamechat/dm/:id/file', upload('/temp'), async context => {
  await Deno.rename(context.uploadedFiles.file.uri, `${Deno.cwd()}/files/flamechat/dm/${context.params.id}/${context.uploadedFiles.file.filename}`)
})

router.delete('/api/:uid/flamechat/chatroom/:id', async context => {
  await users.updateMany({ 'chatrooms.id': context.params.id }, { $pull: { chatrooms: { id: context.params.id } } })
  Deno.remove(`${Deno.cwd()}/files/flamechat/chatroom/${context.params.id}`, { recursive: true })
  await chatrooms.deleteOne({ id: context.params.id })
})

router.get('/api/:uid/flamechat/chatroom/:id/request', async context => {
  const chatroom = await chatrooms.findOne({ id: context.params.id })
  let user = await users.findOne({ _id: { $oid: context.params.uid } })

  let banned = false
  chatroom.people.banned.forEach(person => { console.log(person._id); if (context.params.uid == person._id) banned = true; })

  if (!banned) {
    const userData: Person = {
      _id: user._id.$oid,
      username: user.username,
      color: user.color,
      pic: `https://www.theparadigmdev.com/relay/profile-pics/${user._id.$oid}.jpg`
    }
    await chatrooms.updateOne({ id: context.params.id }, { $push: { 'people.requested': userData } })

    const chatroomData: StoredChatroom = {
      name: chatroom.name,
      id: chatroom.id,
      icon: chatroom.icon,
      status: 'requested'
    }
    await chatrooms.updateOne({ id: context.params.id }, { $push: { 'people.requested': userData } })
    await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { chatrooms: chatroomData } })

    context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
    context.response.type = 'application/json'  
  } else {
    context.response.body = { error: 'banned' }
    context.response.type = 'application/json'  
  }
})

router.delete('/api/:uid/flamechat/chatroom/:id/undo-request', async context => {
  await users.updateOne({ _id: { $oid: context.params.user } }, { $pull: { chatrooms: { id: context.params.id } } })
  await chatrooms.updateOne({ id: context.params.id }, { $pull: { 'people.requested': { _id: context.params.user } } })
})

router.delete('/api/:uid/flamechat/chatroom/:id/remove/:user', async context => {
  await users.updateOne({ _id: { $oid: context.params.user } }, { $pull: { chatrooms: { id: context.params.id } } })
  await chatrooms.updateOne({ id: context.params.id }, { $pull: { 'people.approved': { _id: context.params.user } } })
})

router.get('/api/:uid/flamechat/chatroom/:id/request/:user/approve', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  await users.updateOne({ _id: { $oid: context.params.user }, 'chatrooms.id': context.params.id }, { $set: { 'chatrooms.$.status': 'approved' } })
  await chatrooms.updateOne({ id: context.params.id }, { $pull: { 'people.requested': { _id: context.params.user } } })

  const userData: Person = {
    _id: user._id.$oid,
    username: user.username,
    color: user.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${user._id.$oid}.jpg`
  }
  await chatrooms.updateOne({ id: context.params.id }, { $push: { 'people.approved': userData } })
})

router.delete('/api/:uid/flamechat/chatroom/:id/request/:user/reject', async context => {
  await users.updateOne({ _id: { $oid: context.params.user } }, { $pull: { chatrooms: { id: context.params.id } } })
  await chatrooms.updateOne({ id: context.params.id }, { $pull: { 'people.requested': { _id: context.params.user } } })
})

router.delete('/api/:uid/flamechat/chatroom/:id/ban/:user', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })

  await users.updateOne({ _id: { $oid: context.params.user } }, { $pull: { chatrooms: { id: context.params.id } } })
  await chatrooms.updateOne({ id: context.params.id }, { $pull: { 'people.requested': { _id: context.params.user } } })
  await chatrooms.updateOne({ id: context.params.id }, { $pull: { 'people.approved': { _id: context.params.user } } })

  const userData: Person = {
    _id: user._id.$oid,
    username: user.username,
    color: user.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${user._id.$oid}.jpg`
  }
  await chatrooms.updateOne({ id: context.params.id }, { $pull: { 'people.banned': userData } })
})

router.get('/api/:uid/flamechat/chatroom/:id/unban/:user', async context => {
  await chatrooms.updateOne({ id: context.params.id }, { $pull: { 'people.banned': { _id: context.params.user } } })
})

router.delete('/api/:uid/flamechat/chatroom/:id/purge', async context => {
  await chatrooms.updateOne({ id: context.params.id }, { $set: { messages: [] } })
})

export default router