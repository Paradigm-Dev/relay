// @deno-types='https://deno.land/x/oak/types.d.ts'
import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { User } from '../interfaces/User.interface.ts'
const users = db.collection<User>('users')

import { genSalt, hash, compare } from 'https://deno.land/x/bcrypt/mod.ts'

import parseBody from '../helpers/parseBody.ts'
import generateObjectId from '../helpers/generateObjectId.ts'

router.post('/api/auth/signup', async context => {
  const body = await parseBody(context)

  const salt = await genSalt(10)
  const password = await hash(body.password, salt)

  const _id = generateObjectId()
  let user: User = {
    _id,
    username: body.username,
    password,
    bio: body.bio,
    color: body.color,
    chatrooms: [],
    people: {
      requests: [],
      approved: [],
      blocked: [],
      sent: [],
      blocked_by: []    
    },
    rights: {
      admin: false,
      author: false,
      asteroid: false,
      patriot: false,
      developer: false,
      apollo: body.invite_code ? true : false   
    },
    moonrocks: 0,
    books: [],
    movies: [],
    music: [],
    files: [],
    banned: false,
    strikes: 0,
    in: true,
    posts: []
  }

  await Deno.mkdir(`${Deno.cwd()}/drawer/${_id}`)

  await users.insertOne(user)

  user = await users.findOne({ _id: { $oid: _id } })

  context.response.type = 'application/json'
  context.response.body = user
})

router.post('/api/auth/signin', async context => {
  const body = await parseBody(context)

  let user = await users.findOne({ username: body.username })

  if (user) {
    const result = await compare(body.password, user.password)
  
    if (result) {
      await users.updateOne({ _id: { $oid: user._id.$oid } }, { $set: { in: true } })
      user.in = true
      context.response.type = 'application/json'
      context.response.body = user
    } else {
      context.response.type = 'application/json'
      context.response.body = { error: 'Password is incorrect' }
    }
  } else {
    context.response.type = 'application/json'
    context.response.body = { error: 'Username is incorrect' }
  }
})

router.get('/api/:uid/auth/signout', async context => {
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $set: { in: false } })
})

router.post('/api/:uid/auth/reset', async context => {
  const body = await parseBody(context)

  let user = await users.findOne({ _id: { $oid: context.params.uid } })

  const curPass = await compare(body.current, user.password)
  if (curPass) {
    const salt = await genSalt(10)
    const password = await hash(body.password, salt)
    
    await users.updateOne({ _id: { $oid: context.params.uid } }, { $set: { password } })

    user.password = password
    context.response.type = 'application/json'
    context.response.body = user
  } else {
    context.response.type = 'application/json'
    context.response.body = { error: 'Current password is incorrect' }
  }
})

export default router