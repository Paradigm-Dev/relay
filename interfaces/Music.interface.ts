import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'

interface Song {
  title: string
  file: string
  length: string
  track: number
  lyrics: any
}

interface Music {
  _id: ObjectId
  artist: string
  live: boolean
  cover: string
  title: string
  songs: Song[]
  genre: string
}

export {
  Music,
  Song
}