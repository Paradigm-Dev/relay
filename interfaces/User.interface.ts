import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'

interface UserBook {
  book_id: string
  rating: number
  favorite: boolean
}

interface UserMovie {
  movie_id: string
  rating: number
  favorite: boolean
}

interface UserMusic {
  music_id: string
  rating: number
  favorite: boolean
}

interface StoredChatroom {
  name: string
  id: string
  icon: string
  status: string
}

interface DrawerFile {
  _id: ObjectId
  name: string
  type: string
  size: string
  date: string
  path: string
}

interface Person {
  _id: string
  username: string
  color: string
  pic: string
  liked_posts: string[]
  dm: string
}

interface Post {
  _id: ObjectId
  content: string
  timestamp: string
  likes: number
  recasts: number
}

interface People {
  requests: Person[]
  approved: Person[]
  blocked: Person[]
  sent: Person[]
  blocked_by: Person[]
}

interface Rights {
  admin: boolean
  author: boolean
  asteroid: boolean
  patriot: boolean
  developer: boolean
  apollo: boolean
}

interface User {
  _id: ObjectId
  username: string
  password: string
  bio: string
  color: string
  chatrooms: StoredChatroom[]
  people: People
  rights: Rights
  moonrocks: number
  books: UserBook[]
  movies: UserMovie[]
  music: UserMusic[]
  files: DrawerFile[]
  banned: boolean
  strikes: number
  in: boolean
  posts: Post[]
}

export {
  UserBook,
  UserMovie,
  UserMusic,
  StoredChatroom,
  DrawerFile,
  Person,
  Post,
  People,
  Rights,
  User
}