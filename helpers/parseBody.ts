import { RouterContext, Router } from 'https://deno.land/x/oak/mod.ts'

export default async function parseBody(context: RouterContext) {
  const request = await context.request.body()
  const body = JSON.parse(request.value)
  return body
}