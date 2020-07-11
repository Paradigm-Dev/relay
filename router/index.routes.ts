import { Router, send } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'

import authentication from './authentication.routes.ts'
import broadcast from './broadcast.routes.ts'
import drawer from './drawer.routes.ts'
import flamechat from './flamechat.routes.ts'
import media from './media.routes.ts'
import paradox from './paradox.routes.ts'
import people from './people.routes.ts'
import terminal from './terminal.routes.ts'
import transmission from './transmission.routes.ts'
import user from './user.routes.ts'

// router.get('/', async context => {
  
// })

export default {
  index: router,
  authentication,
  broadcast,
  drawer,
  flamechat,
  media,
  paradox,
  people,
  terminal,
  transmission,
  user
}