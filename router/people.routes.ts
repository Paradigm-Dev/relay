// @deno-types='https://deno.land/x/oak/types.d.ts'
import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { User, Person } from '../interfaces/User.interface.ts'
const users = db.collection<User>('users')

router.get('/api/:uid/people', async context => {
  const usersList = await users.find({})

  let filtered: any[] = []
  usersList.forEach(user => {
    filtered.push({
      _id: user._id.$oid,
      username: user.username,
      color: user.color,
      in: user.in,
      bio: user.bio,
      pic: 'https://www.theparadigmdev.com/relay/profile-pics/' + user._id + '.jpg',
      posts: user.posts
    })
  })

  context.response.body = filtered
  context.response.type = 'application/json'
})

router.get('/api/:uid/people/short', async context => {
  const usersList = await users.find({})

  let filtered: any[] = []
  usersList.forEach(user => {
    filtered.push({
      _id: user._id.$oid,
      username: user.username,
      color: user.color,
      in: user.in,
      pic: 'https://www.theparadigmdev.com/relay/profile-pics/' + user._id + '.jpg'
    })
  })

  context.response.body = filtered
  context.response.type = 'application/json'
})


router.get('/api/:uid/people/request/:user/send', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const profile = await users.findOne({ _id: { $oid: context.params.user } })

  const profileData: Person = {
    _id: profile._id.$oid,
    username: profile.username,
    color: profile.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.user}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { 'people.sent': profileData } })

  const userData: Person = {
    _id: profile._id.$oid,
    username: user.username,
    color: user.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.uid}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.user } }, { $push: { 'people.requests': userData } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.get('/api/:uid/people/request/:user/approve', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const profile = await users.findOne({ _id: { $oid: context.params.user } })

  const profileData: Person = {
    _id: profile._id.$oid,
    username: profile.username,
    color: profile.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.user}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { 'people.approved': profileData }, $pull: { 'people.sent': profileData } })

  const userData: Person = {
    _id: profile._id.$oid,
    username: user.username,
    color: user.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.uid}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.user } }, { $push: { 'people.approved': userData }, $pull: { 'people.requests': userData } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.delete('/api/:uid/people/request/:user/reject', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const profile = await users.findOne({ _id: { $oid: context.params.user } })

  const profileData: Person = {
    _id: profile._id.$oid,
    username: profile.username,
    color: profile.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.user}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $pull: { 'people.sent': profileData } })

  const userData: Person = {
    _id: profile._id.$oid,
    username: user.username,
    color: user.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.uid}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.user } }, { $pull: { 'people.requests': userData } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.delete('/api/:uid/people/remove/:user', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const profile = await users.findOne({ _id: { $oid: context.params.user } })

  const profileData: Person = {
    _id: profile._id.$oid,
    username: profile.username,
    color: profile.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.user}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $pull: { 'people.approved': profileData } })

  const userData: Person = {
    _id: profile._id.$oid,
    username: user.username,
    color: user.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.uid}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.user } }, { $pull: { 'people.approved': userData } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.delete('/api/:uid/people/block/:user', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const profile = await users.findOne({ _id: { $oid: context.params.user } })

  const profileData: Person = {
    _id: profile._id.$oid,
    username: profile.username,
    color: profile.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.user}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { 'people.blocked': profileData } })

  await users.updateOne({ _id: { $oid: context.params.user } }, { $push: { 'people.blocked_by': context.params.uid } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.delete('/api/:uid/people/unblock/:user', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const profile = await users.findOne({ _id: { $oid: context.params.user } })

  const profileData: Person = {
    _id: profile._id.$oid,
    username: profile.username,
    color: profile.color,
    pic: `https://www.theparadigmdev.com/relay/profile-pics/${context.params.user}.jpg`,
    liked_posts: [],
    dm: ''
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $pull: { 'people.blocked': profileData } })

  await users.updateOne({ _id: { $oid: context.params.user } }, { $pull: { 'people.blocked_by': context.params.uid } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

export default router