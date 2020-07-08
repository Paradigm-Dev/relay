import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'

interface Book {
  _id: ObjectId
  author: string
  live: boolean
  cover: string
  link: string
  summary: string
  title: string
}

export {
  Book
}