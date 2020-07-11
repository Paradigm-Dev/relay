// @deno-types='https://deno.land/x/oak/types.d.ts'
import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { User } from '../interfaces/User.interface.ts'
import { Book } from '../interfaces/Book.interface.ts'
import { Movie } from '../interfaces/Movie.interface.ts'
import { Music } from '../interfaces/Music.interface.ts'
const users = db.collection<User>('users')
const books = db.collection<Book>('books')
const movies = db.collection<Movie>('movies')
const music = db.collection<Music>('musics')

import parseBody from '../helpers/parseBody.ts'
import generateObjectId from '../helpers/generateObjectId.ts'

import { upload } from 'https://deno.land/x/upload_middleware_for_oak_framework/mod.ts'

router.get('/api/:uid/media/books', async context => {
  const booksList = await books.find({})
  context.response.body = booksList
  context.response.type = 'application/json'
})

router.post('/api/:uid/media/books/:id', async context => {
  const body = await parseBody(context)

  const saving = {
    book_id: context.params.id,
    rating: body.rating,
    favorite: body.favorite
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { books: saving } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.get('/api/:uid/media/movies', async context => {
  const moviesList = await movies.find({})
  context.response.body = moviesList
  context.response.type = 'application/json'
})

router.post('/api/:uid/media/movies/:id', async context => {
  const body = await parseBody(context)

  const saving = {
    movie_id: context.params.id,
    rating: body.rating,
    favorite: body.favorite
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { movies: saving } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.get('/api/:uid/media/music', async context => {
  const musicList = await music.find({})
  context.response.body = musicList
  context.response.type = 'application/json'
})

router.post('/api/:uid/media/music/:id', async context => {
  const body = await parseBody(context)

  const saving = {
    music_id: context.params.id,
    rating: body.rating,
    favorite: body.favorite
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { music: saving } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.post('/api/:uid/media/data', async context => {
  const body = await parseBody(context)

  let _id
  switch (body.type) {
    case 'book':
      _id = generateObjectId()
      const newBook: Book = {
        _id,
        author: body.author,
        live: true,
        cover: `https://www.theparadigmdev.com/relay/books/img/${_id.$oid}.jpg`,
        link: `https://www.theparadigmdev.com/relay/books/${_id.$oid}.pdf`,
        summary: body.summary,
        title: body.title
      }
      await books.insertOne(newBook)
      context.response.body = { _id: _id.$oid }
      context.response.type = 'application/json'
      break
    case 'movie':
      _id = generateObjectId()
      const newMovie: Movie = {
        _id,
        genre: body.genre,
        live: true,
        cover: `https://www.theparadigmdev.com/relay/movies/img/${_id.$oid}.jpg`,
        link: `https://www.theparadigmdev.com/relay/movies/${_id.$oid}.pdf`,
        summary: body.summary,
        title: body.title
      }
      await movies.insertOne(newMovie)
      context.response.body = { _id: _id.$oid }
      context.response.type = 'application/json'
      break
  }
})

router.post('/api/:uid/media/create/:id/files/:type', upload('/temp'), async context => {
  let item
  switch (context.params.type) {
    case 'book': item = await books.findOne({ _id: { $oid: context.params.id } }); break;
    case 'movie': item = await movies.findOne({ _id: { $oid: context.params.id } }); break;
    // case 'music': item = await music.findOne({ _id: { $oid: context.params.id } }); break;
  }

  if (item) {
    await Deno.rename(context.uploadedFiles.cover.uri, `${Deno.cwd()}/files/${context.params.type == 'music' ? 'music' : context.params.type + 's'}/img/${item._id.$oid}`)
    await Deno.rename(context.uploadedFiles.file.uri, `${Deno.cwd()}/files/${context.params.type == 'music' ? 'music' : context.params.type + 's'}/${item._id.$oid}.${context.uploadedFiles.file.name.slice(context.uploadedFiles.file.filename.lastIndexOf('.') + 1)}`)
  }
})

export default router