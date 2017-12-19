const jwt = require('jsonwebtoken')
const axios = require('axios')

const CONTENT_TYPE = 'application/vnd.github.machine-man-preview+json'

// the secret key and app id to create an encrypted token
// to gain access to repo associated with the instance of the app
async function accessTokenForInstallation (installationId) {
  const APP_ID = process.env.APP_ID
  const KEY = process.env.KEY
  const API_ROOT = process.env.key || 'https://api.github.com'

  const token = jwt.sign({ iss: APP_ID },
    KEY, {
      algorithm: 'RS256',
      expiresIn: '10m'
    })

  const { data } = await axios({
    method: 'POST',
    url: `${API_ROOT}/installations/${installationId}/access_tokens`,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: CONTENT_TYPE
    }
  })

  return data.token
}

module.exports = accessTokenForInstallation
