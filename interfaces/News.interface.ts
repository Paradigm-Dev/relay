export default interface News {
  _id: { $oid: string }
  author: string
  cover: string
  content: string
  timestamp: string
  title: string
  live: boolean
}