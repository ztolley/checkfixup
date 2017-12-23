const axios = require('axios')
const uuid = require('uuid')

async function logEvent (status) {
  if (!process.env.GA) {
    return
  }

  const params = {
    v: 1,
    t: 'event',
    tid: process.env.GA,
    cid: uuid(),
    ec: 'checkfixup',
    ea: 'setStatus',
    ev: status === 'success' ? 1 : 0
  }

  axios.get('https://ga-dev-tools.appspot.com/hit-builder/', { params })
}

module.exports = logEvent
