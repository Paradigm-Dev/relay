type MessageType = 'message' | 'left' | 'join' | 'file'

interface Message {
  _id: { $oid: string }
  color: string
  username: string
  user_id: string
  content: string
  pic: string
  timestamp: string
  edits: number
  type: MessageType
  url: string
}

interface Person {
  _id: string
  username: string
  color: string
  pic: string
}

export default interface DM {
  _id: { $oid: string }
  messages: [Message]
  people: [Person]
}