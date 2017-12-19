const accessTokenForInstallation = require('./access_token_for_installation')
const compareCommits = require('./compare_commits')
const createCommitStatus = require('./create_commit_status')
const branchHasFixup = require('./branch_has_fixup')

module.exports = {
  accessTokenForInstallation,
  compareCommits,
  createCommitStatus,
  branchHasFixup
}
