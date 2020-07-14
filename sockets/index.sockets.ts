import { Router, send } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

// import authentication from './authentication.sockets.ts'
import flamechat from './flamechat.sockets.ts'

router.get('/ws', async context => {
  
})

export default {
  index: router,
  // authentication,
  flamechat,
}