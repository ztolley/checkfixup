const compareCommits = require('./compare_commits')

function commitHasFixup ({ commit }) {
  return commit.message.indexOf('fixup!') >= 0
}

async function branchHasFixup ({ token, repoName, branch, defaultBranch }) {
  const commits = await compareCommits({ token, repoName, branch, defaultBranch })
  const fixups = commits.filter(commitHasFixup)
  return fixups.length > 0
}

module.exports = branchHasFixup
