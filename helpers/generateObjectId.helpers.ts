import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'

export default function generateObjectId(): ObjectId {
  let result = ''
  const characters = 'ABCDEFabcdef0123456789'
  let charactersLength = characters.length
  for (let i = 0; i < 24; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return { $oid: result }
}