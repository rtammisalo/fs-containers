const redis = require('redis')
const { promisify } = require('util')
const { REDIS_URL } = require('../util/config')

let getAsync
let setAsync

let init_values = async () => {
  if (setAsync.toString() !== 'redisIsDisabled') {
    await setAsync('added_todos', 0)
  }
}

if (!REDIS_URL) {
  const redisIsDisabled = () => {
    console.log('No REDIS_URL set, Redis is disabled')
    return null
  }
  getAsync = redisIsDisabled
  setAsync = redisIsDisabled
} else {
  const client = redis.createClient({
    url: REDIS_URL,
  })

  getAsync = promisify(client.get).bind(client)
  setAsync = promisify(client.set).bind(client)

  init_values()
}

module.exports = {
  getAsync,
  setAsync,
}
