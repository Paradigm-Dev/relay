// PACKAGES
import { moment } from "https://deno.land/x/moment/moment.ts";
// @deno-types="https://deno.land/x/oak/types.d.ts"
import { Application } from 'https://deno.land/x/oak/mod.ts'


// APPLICATION
console.log('\x1b[32m[  INIT  ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, `\x1b[34mapplication`, '\x1b[0minstantiated')
const app = new Application()


// ROUTER
console.log('\x1b[32m[  INIT  ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, `\x1b[34mrouter`, '\x1b[0mmapping routes')
import router from './router/index.ts'
app.use(router.index.routes())
app.use(router.index.allowedMethods())

app.use(router.broadcast.routes())
app.use(router.broadcast.allowedMethods())

app.use(router.drawer.routes())
app.use(router.drawer.allowedMethods())

app.use(router.flamechat.routes())
app.use(router.flamechat.allowedMethods())

app.use(router.media.routes())
app.use(router.media.allowedMethods())

app.use(router.paradox.routes())
app.use(router.paradox.allowedMethods())

app.use(router.terminal.routes())
app.use(router.terminal.allowedMethods())

app.use(router.transmission.routes())
app.use(router.transmission.allowedMethods())

app.use(router.users.routes())
app.use(router.users.allowedMethods())
console.log('\x1b[32m[  INIT  ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, `\x1b[34mrouter`, '\x1b[0mroutes mapped')


// SERVER
const hostname = '192.168.1.178'
const port = 443
console.log('\x1b[32m[ SERVER ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, `\x1b[34mhttps://${hostname}:${port}`, '\x1b[0mserver listening')
await app.listen({ hostname, port })