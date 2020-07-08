export default interface Book {
  _id: { $oid: string }
  author: string
  live: boolean
  cover: string
  link: string
  summary: string
  title: string
}