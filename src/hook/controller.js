/* eslint camelcase: 0 */
const { get, assign } = require('lodash')

const {
  accessTokenForInstallation,
  branchHasFixup,
  createCommitStatus
} = require('../github')

/* POST Github hook
 * Accepts a webhook call from Github details a Git Push.
 * Analyses the push and sets a status to indicate if the
 * branch if belongs to has a fixup commit
 * 'success' indicates no fixups
 * 'failure' indicates branch contains a fixup
*/
async function postHook (req, res, next) {
  try {
    const pushData = req.body
    const { default_branch: defaultBranch, full_name: repoName } = pushData.repository
    const branch = pushData.ref.substr(11)
    const headCommit = get(pushData, 'head_commit.id')
    const installationId = get(pushData, 'installation.id')

    // Ignore all calls not for a push or on the default branch
    if (branch === defaultBranch || get(req, 'headers.X-GitHub-Event') !== 'push') {
      return res.send('Invalid event, ignoring', 202)
    }

    const token = await accessTokenForInstallation(installationId)

    const hasFixup = await branchHasFixup({ token, repoName, branch, defaultBranch })

    const baseStatus = { token, repoName, sha: headCommit }

    const status = hasFixup
      ? assign({}, baseStatus, { state: 'failure', description: 'Branch contains fixup!' })
      : assign({}, baseStatus, { state: 'success', description: 'No fixups found' })
    await createCommitStatus(status)
  } catch (error) {
    return res.send(500, error.message)
  }

  res.sendStatus(200)
}

module.exports = { postHook }
