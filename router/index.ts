import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import broadcast from './broadcast.routes.ts'
import drawer from './drawer.routes.ts'
import flamechat from './flamechat.routes.ts'
import media from './media.routes.ts'
import paradox from './paradox.routes.ts'
import terminal from './terminal.routes.ts'
import transmission from './transmission.routes.ts'
import users from './users.routes.ts'

router.get('/', context => {
  context.response.body = 'Hello world!'
})

export default {
  index: router,
  broadcast,
  drawer,
  flamechat,
  media,
  paradox,
  terminal,
  transmission,
  users
}