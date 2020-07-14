// @deno-types='https://deno.land/x/oak/types.d.ts'
import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { User } from '../interfaces/User.interface.ts'
import { Chatroom } from '../interfaces/Chatroom.interface.ts'
const users = db.collection<User>('users')
const chatrooms = db.collection<Chatroom>('chatrooms')

import parseBody from '../helpers/parseBody.helpers.ts'
import generateObjectId from '../helpers/generateObjectId.helpers.ts'

import { WebSocket, acceptWebSocket, acceptable, isWebSocketCloseEvent } from 'https://deno.land/std/ws/mod.ts'

export const usersMap = new Map<any, WebSocket>()

function broadcast(message: any, senderId?: string): void {
  if (!message) return;
  for (const user of usersMap.values()) {
    user.send(senderId ? `[${senderId}]: ${message}` : message);
  }
}

router.get('/ws', async context => {
  if (acceptable(context.request.serverRequest)) {
    const socket = await acceptWebSocket({
      conn: context.request.serverRequest.conn,
      // @ts-ignore
      bufReader: context.request.serverRequest.r,
      // @ts-ignore
      bufWriter: context.request.serverRequest.w,
      headers: context.request.serverRequest.headers
    })

    if (context.params.uid) usersMap.set(context.params.uid, socket)
    broadcast(`${context.params.uid} is connected`)

    // Wait for new messages
    for await (const event of socket) {
      const message = event

      broadcast(message, context.params.uid)

      // Unregister user connection
      if (!message && isWebSocketCloseEvent(event)) {
        usersMap.delete(context.params.uid)
        broadcast(`${context.params.uid} is disconnected`)
        break
      }
    }
  } else {
    throw new Error('Error when connecting websocket')
  }

  // context.response.body = allNews
  // context.response.type = 'application/json'
})

export default router