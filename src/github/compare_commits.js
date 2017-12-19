const axios = require('axios')

async function compareCommits ({ token, repoName, defaultBranch, branch }) {
  const API_ROOT = process.env.API_ROOT || 'https://api.github.com'

  const url = `${API_ROOT}/repos/${repoName}/compare/${defaultBranch}...${branch}?access_token=${token}`
  const { data } = await axios.get(url)

  return data.commits
}

module.exports = compareCommits
