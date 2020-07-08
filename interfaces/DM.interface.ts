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

interface DM {
  _id: ObjectId
  messages: Message[]
  people: Person[]
}

export {
  MessageType,
  Message,
  Person,
  DM
}