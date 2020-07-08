import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'

interface News {
  _id: ObjectId
  author: string
  cover: string
  content: string
  timestamp: string
  title: string
  live: boolean
}

export {
  News
}