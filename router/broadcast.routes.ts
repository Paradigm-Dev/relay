import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { User, Post } from '../interfaces/User.interface.ts'
const users = db.collection<User>('users')

import parseBody from '../helpers/parseBody.ts'
import generateObjectId from '../helpers/generateObjectId.ts'

router.post('/api/:uid/broadcast', async context => {
  const body = await parseBody(context)

  const _id = generateObjectId()

  const newPost: Post = {
    _id,
    content: body.content,
    timestamp: body.timestamp,
    likes: body.likes,
    recasts: body.recasts
  }

  await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { posts: { $each: [ newPost ], $position: 0 } } })
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.body = user
  context.response.type = 'application/json'
})

router.delete('/api/:uid/broadcast/:id', async context => {
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $pull: { posts: { _id: { $oid: context.params.id } } } })
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.body = user
  context.response.type = 'application/json'
})

router.get('/api/:uid/broadcast/like/:profile/:post', async context => {
  await users.updateOne({ _id: context.params.uid, 'people.approved._id': context.params.profile }, { $push: { 'people.approved.$.liked_posts': context.params.post } })
  await users.updateOne({ _id: context.params.profile, 'posts._id': context.params.post }, { $inc: { 'posts.$.likes': 1 } })

  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const profile = await users.findOne({ _id: { $oid: context.params.profile } })
  context.response.body = { user, profile }
  context.response.type = 'application/json'
})

router.get('/api/:uid/broadcast/unlike/:profile/:post', async context => {
  await users.updateOne({ _id: context.params.uid, 'people.approved._id': context.params.profile }, { $pull: { 'people.approved.$.liked_posts': context.params.post } })
  await users.updateOne({ _id: context.params.profile, 'posts._id': context.params.post }, { $inc: { 'posts.$.likes': -1 } })

  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const profile = await users.findOne({ _id: { $oid: context.params.profile } })
  context.response.body = { user, profile }
  context.response.type = 'application/json'
})

export default router