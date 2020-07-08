import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'

interface Movie {
  _id: ObjectId
  genre: string
  live: boolean
  cover: string
  link: string
  summary: string
  title: string
}

export {
  Movie
}