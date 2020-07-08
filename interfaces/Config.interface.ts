interface Router {
  flamechat: boolean
  satellite: boolean
  paradox: boolean
  drawer: boolean
  media: boolean
  home: boolean
  write: boolean
  people: boolean
  broadcast: boolean
  transmission: boolean
  developer: boolean
}

export default interface Config {
  _id: { $oid: string }
  sign_up: boolean
  migrate: boolean
  reset: boolean
  shutdown: boolean
  router: Router
  find: 'this'
  banned: [string]
}