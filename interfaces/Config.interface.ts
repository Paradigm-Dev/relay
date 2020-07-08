import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'

interface Router {
  flamechat: boolean
  satellite: boolean
  paradox: boolean
  drawer: boolean
  media: boolean
  home: boolean
  write: boolean
  people: boolean
  broadcast: boolean
  transmission: boolean
  developer: boolean
}

interface Config {
  _id: ObjectId
  sign_up: boolean
  migrate: boolean
  reset: boolean
  shutdown: boolean
  router: Router
  find: 'this'
  banned: [string]
}

export {
  Router,
  Config
}