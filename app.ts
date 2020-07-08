// PACKAGES
import { moment } from "https://deno.land/x/moment/moment.ts"
// @deno-types='https://deno.land/x/oak/types.d.ts'
import { Application, send, HttpError, Status } from 'https://deno.land/x/oak/mod.ts'
import {
  green,
  cyan,
  bold,
  yellow,
  red,
} from 'https://deno.land/std@0.58.0/fmt/colors.ts'


// APPLICATION
console.log('\x1b[32m[ SERVER ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, '\x1b[0minstantiated')
const app = new Application()


// DATABASE
import db from './db.ts'


// ROUTER
console.log('\x1b[32m[ ROUTER ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, '\x1b[0mmapping routes')
import router from './router/index.routes.ts'


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

app.use(async context => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/paradigm`,
    index: 'index.html'
  })
})

console.log('\x1b[32m[ ROUTER ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, '\x1b[0mroutes mapped')


app.use(async (context, next) => {
  if (context.request.hasBody) {
    const bodyUnParsed = await context.request.body()
    const bodyParsed = JSON.parse(bodyUnParsed.value)
    context.request.body = bodyParsed
    next()
  } else next()
})


// ERROR HANDLING
app.use(async (context, next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof HttpError) {
      context.response.status = e.status as any;
      if (e.expose) {
        context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${e.message}</h1>
              </body>
            </html>`;
      } else {
        context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${Status[e.status]}</h1>
              </body>
            </html>`;
      }
    } else if (e instanceof Error) {
      context.response.status = 500;
      context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>500 - Internal Server Error</h1>
              </body>
            </html>`;
      console.log("Unhandled Error:", red(bold(e.message)));
      console.log(e.stack);
    }
  }
});


// RESPONSE TIME
app.use(async (context, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  context.response.headers.set('X-Response-Time', `${ms}ms`)
})


// SERVER
const hostname = '192.168.1.178'
const port = 8081
console.log('\x1b[32m[ SERVER ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, `\x1b[34mhttps://${hostname}:${port}`, '\x1b[0mserver listening')
await app.listen({ hostname, port })