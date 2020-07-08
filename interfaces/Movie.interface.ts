export default interface Movie {
  _id: { $oid: string }
  genre: string
  live: boolean
  cover: string
  link: string
  summary: string
  title: string
}