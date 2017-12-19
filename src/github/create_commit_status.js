const axios = require('axios')

async function createCommitStatus ({ token, repoName, sha, state, description }) {
  const API_ROOT = process.env.API_ROOT || 'https://api.github.com'
  const url = `${API_ROOT}/repos/${repoName}/statuses/${sha}?access_token=${token}`
  const status = { state, description }

  const { data } = await axios.post(url, status)

  return data
}

module.exports = createCommitStatus
