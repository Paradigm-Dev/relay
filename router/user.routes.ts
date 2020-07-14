// @deno-types='https://deno.land/x/oak/types.d.ts'
import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { User } from '../interfaces/User.interface.ts'
import { Chatroom } from '../interfaces/Chatroom.interface.ts'
import { DM } from '../interfaces/DM.interface.ts'
const users = db.collection<User>('users')
const chatrooms = db.collection<Chatroom>('chatrooms')
const dms = db.collection<DM>('dms')

import parseBody from '../helpers/parseBody.helpers.ts'

import { upload } from 'https://deno.land/x/upload_middleware_for_oak_framework/mod.ts'

router.post('/api/:uid/user/update', async context => {
  const body = await parseBody(context)
  
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $set: { username: body.username, bio: body.bio, color: body.color } })
  
  await users.updateMany({ 'people.approved._id': context.params.uid }, { $set: { 'people.approved.$.username': body.username, 'people.approved.$.color': body.color } })
  await users.updateMany({ 'people.blocked._id': context.params.uid }, { $set: { 'people.blocked.$.username': body.username, 'people.blocked.$.color': body.color } })
  await users.updateMany({ 'people.requests._id': context.params.uid }, { $set: { 'people.requests.$.username': body.username, 'people.requests.$.color': body.color } })
  await users.updateMany({ 'people.sent._id': context.params.uid }, { $set: { 'people.sent.$.username': body.username, 'people.sent.$.color': body.color } })
  
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
  context.response.body = user
})

router.get('/api/:uid/user/:id', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.id } })

  if (user) {
    const data = {
      username: user.username,
      color: user.color,
      in: user.in,
      bio: user.bio,
      pic: 'https://www.theparadigmdev.com/relay/profile-pics/' + user._id + '.jpg',
      _id: user._id.$oid
    }
    context.response.type = 'application/json'
    context.response.body = data
  } else {
    context.response.type = 'application/json'
    context.response.body = { error: 'User does not exist' }
  }
})

router.put('/api/:uid/user/moonrocks/:count', async context => {
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $inc: { moonrocks: context.params.count } })

  context.response.type = 'application/json'
  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
})

router.post('/api/:uid/user/pic', upload('/temp'), async context => {  
  await Deno.rename(context.uploadedFiles.file.uri, `${Deno.cwd()}/files/profile-pics/${context.params.uid}.jpg`)

  context.response.type = 'application/json'
  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
})

router.delete('/api/:uid/user', async context => {
  const user = await users.findOne({ username: context.params.username })

  await chatrooms.updateMany({ 'people.requested.username': context.params.username }, { $pull: { 'people.requested': { username: context.params.username } } })
  await chatrooms.updateMany({ 'people.approved.username': context.params.username }, { $pull: { 'people.approved': { username: context.params.username } } })
  await chatrooms.updateMany({ 'people.banned.username': context.params.username }, { $pull: { 'people.banned': { username: context.params.username } } })

  await Deno.remove(`${Deno.cwd()}/drawer/${user._id.$oid}`, { recursive: true })
  await users.updateMany({ 'people.requests.username': context.params.username }, { $pull: { 'people.requests': { username: context.params.username } } })
  await users.updateMany({ 'people.approved.username': context.params.username }, { $pull: { 'people.approved': { username: context.params.username } } })
  await users.updateMany({ 'people.blocked.username': context.params.username }, { $pull: { 'people.blocked': { username: context.params.username } } })
  await users.updateMany({ 'people.sent.username': context.params.username }, { $pull: { 'people.sent': { username: context.params.username } } })
  await users.updateMany({ 'people.blocked_by': user._id.$oid }, { $pull: { 'people.blocked_by': user._id.$oid } })

  await dms.deleteMany({ 'people.username': context.params.username })

  await users.deleteOne({ username: context.params.username })
})

export default router