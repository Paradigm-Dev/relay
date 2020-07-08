import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'

type MessageType = 'message' | 'left' | 'join' | 'file'

interface Message {
  _id: ObjectId
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

interface People {
  approved: Person[]
  requested: Person[]
  banned: Person[]
}

interface Chatroom {
  _id: ObjectId
  messages: Message[]
  icon: string
  id: string
  name: string
  owner: string
  owner_id: string
  theme: string
  people: People
}

export {
  MessageType,
  Message,
  Person,
  People,
  Chatroom
}