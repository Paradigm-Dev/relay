// @deno-types='https://deno.land/x/mongo/ts/types.ts'
import { MongoClient } from 'https://deno.land/x/mongo/mod.ts'
import { moment } from 'https://deno.land/x/moment/moment.ts'

console.log('\x1b[32m[   DB   ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, `\x1b[34mmongodb://192.168.1.82:27017`, '\x1b[0mconnecting...')
const client = new MongoClient()
await client.connectWithUri('mongodb://192.168.1.82:27017')
const db = client.database('paradigm')
console.log('\x1b[32m[   DB   ]', `\x1b[31m${moment().format('MM/DD/YYYY, HH:MM:SS')}`, `\x1b[34mmongodb://192.168.1.82:27017`, '\x1b[0mconnected')

export default db
