// @deno-types='https://deno.land/x/oak/types.d.ts'
import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { News } from '../interfaces/News.interface.ts'
const news = db.collection<News>('news')

import parseBody from '../helpers/parseBody.ts'
import generateObjectId from '../helpers/generateObjectId.ts'

router.get('/api/:uid/paradox', async context => {
  const allNews = await news.find({})
  context.response.body = allNews
  context.response.type = 'application/json'
})

router.post('/api/:uid/paradox', async context => {
  const body = await parseBody(context)

  const _id = generateObjectId()

  const newNews: News = {
    _id,
    author: body.author,
    cover: body.cover,
    content: body.content,
    timestamp: body.timestamp,
    title: body.title,
    live: body.live
  }

  await news.insertOne(newNews)
  const allNews = await news.find({})
  context.response.body = allNews
  context.response.type = 'application/json'
})

export default router