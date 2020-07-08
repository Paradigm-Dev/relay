import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { User } from '../interfaces/User.interface.ts'
import { Chatroom } from '../interfaces/Chatroom.interface.ts'
import { DM } from '../interfaces/DM.interface.ts'
import { Book } from '../interfaces/Book.interface.ts'
import { Movie } from '../interfaces/Movie.interface.ts'
import { Music } from '../interfaces/Music.interface.ts'
const users = db.collection<User>('users')
const chatrooms = db.collection<Chatroom>('chatrooms')
const dms = db.collection<DM>('dms')
const books = db.collection<Book>('books')
const movies = db.collection<Movie>('movies')
const music = db.collection<Music>('musics')

router.get('/api/:uid/terminal/user/:username/view', async context => {
  const user = await users.findOne({ username: context.params.username })
  if (user) {
    var userData = {
      username: user.username,
      color: user.color,
      _id: user._id.$oid,
      bio: user.bio,
      moonrocks: user.moonrocks,
      rights: {
        admin: user.rights.admin,
        author: user.rights.author,
        asteroid: user.rights.asteroid,
        developer: user.rights.developer
      },
      banned: user.banned,
      strikes: user.strikes,
      in: user.in
    }
    context.response.body = userData
    context.response.type = 'application/json'
  } else {
    context.response.body = { error: `user ${context.params.username} not found` }
    context.response.type = 'application/json'
  }
})

router.put('/api/:uid/terminal/user/:username/strike/:count', async context => {
  await users.updateOne({ username: context.params.username }, { $inc: { strikes: context.params.count } })
})

router.delete('/api/:uid/terminal/user/:username/delete', async context => {
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

router.get('/api/:uid/terminal/list/users', async context => {
  const usersList = await users.find({})
  let usernames: string[] = []
  usersList.forEach(user => {
    usernames.push(`{ username: ${user.username}, _id: ${user._id.$oid} }`)
  })
  context.response.body = usernames
  context.response.type = 'application/json'
})

router.get('/api/:uid/terminal/list/chatrooms', async context => {
  const chatroomsList = await chatrooms.find({})
  let list: string[] = []
  chatroomsList.forEach(chatroom => {
    list.push(`{ name: ${chatroom.name}, id: ${chatroom.id} }`)
  })
  context.response.body = list
  context.response.type = 'application/json'
})

router.get('/api/:uid/terminal/list/books', async context => {
  const booksList = await books.find({})
  let list: string[] = []
  booksList.forEach(book => {
    list.push(`{ title: ${book.title}, author: ${book.author} }`)
  })
  context.response.body = list
  context.response.type = 'application/json'
})

router.get('/api/:uid/terminal/list/movies', async context => {
  const moviesList = await movies.find({})
  let list: string[] = []
  moviesList.forEach(movie => {
    list.push(movie.title)
  })
  context.response.body = list
  context.response.type = 'application/json'
})

router.get('/api/:uid/terminal/list/music', async context => {
  const musicList = await music.find({})
  let list: string[] = []
  musicList.forEach(album => {
    list.push(`{ album: ${album.title}, artist: ${album.artist} }`)
  })
  context.response.body = list
  context.response.type = 'application/json'
})

export default router