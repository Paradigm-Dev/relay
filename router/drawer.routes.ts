// @deno-types='https://deno.land/x/oak/types.d.ts'
import { Router } from 'https://deno.land/x/oak/mod.ts'
const router = new Router()

import db from '../db.ts'
import { User, DrawerFile } from '../interfaces/User.interface.ts'
const users = db.collection<User>('users')

import parseBody from '../helpers/parseBody.ts'
import generateObjectId from '../helpers/generateObjectId.ts'

import { upload } from 'https://deno.land/x/upload_middleware_for_oak_framework/mod.ts'
import { moment } from 'https://deno.land/x/moment/moment.ts'

router.get('/api/:uid/drawer/download/:id', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const file = user.files.filter(file => file._id.$oid == context.params.id)

  await context.send({
    root: `${Deno.cwd()}/drawer/${user._id.$oid}`,
    path: file[0].path
  })
})

router.post('/api/:uid/drawer/rename/:id', async context => {
  const body = await parseBody(context)
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const file = user.files.filter(file => file._id.$oid == context.params.id)

  let newPath = ''
  if (file[0].type == 'workshop/write') newPath = body.name + '.write.json'
  else newPath = body.name + '.' + file[0].path.slice(file[0].path.lastIndexOf('.') + 1)
  await Deno.rename(`${Deno.cwd()}/drawer/${context.params.uid}/${file[0].path}`, `${Deno.cwd()}/drawer/${context.params.uid}/${newPath}`)

  await users.updateOne({ _id: { $oid: context.params.uid }, 'files._id': { $oid: context.params.id } }, { 'files.$.path': newPath })
  await users.updateOne({ _id: { $oid: context.params.uid }, 'files._id': { $oid: context.params.id } }, { 'files.$.name': body.name })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.delete('/api/:uid/drawer/delete/:id', async context => {
  const user = await users.findOne({ _id: { $oid: context.params.uid } })
  const file = user.files.filter(file => file._id.$oid == context.params.id)

  await Deno.remove(`${Deno.cwd()}/drawer/${user._id.$oid}/${file[0].path}`)
  await users.updateOne({ _id: { $oid: context.params.uid }, 'files._id': { $oid: context.params.id } }, { files: { $pull: '$' } })

  context.response.body = await users.findOne({ _id: { $oid: context.params.uid } })
  context.response.type = 'application/json'
})

router.post('/api/:uid/drawer', upload('/temp'), async context => {
  const _id = generateObjectId()
  const newFile: DrawerFile = {
    _id,
    name: context.uploadedFiles.file.filename.slice(0, context.uploadedFiles.file.filename.lastIndexOf('.')),
    type: context.uploadedFiles.file.type,
    size: context.uploadedFiles.file.size + ' B',
    date: moment().format('MM/DD/YYYY [at] h:mm a'),
    path: context.uploadedFiles.file.filename
  }
  await users.updateOne({ _id: { $oid: context.params.uid } }, { $push: { files: newFile } })
  
  await Deno.rename(context.uploadedFiles.file.uri, `${Deno.cwd()}/drawer/${context.params.uid}/${context.uploadedFiles.file.filename}`)
})

export default router