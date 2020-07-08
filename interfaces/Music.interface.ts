interface Song {
  title: string
  file: string
  length: string
  track: number
  lyrics: any
}

export default interface Music {
  _id: { $oid: string }
  artist: string
  live: boolean
  cover: string
  title: string
  songs: [Song]
  genre: string
}