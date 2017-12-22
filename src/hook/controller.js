/* eslint camelcase: 0 */
const { get, assign } = require('lodash')

const {
  accessTokenForInstallation,
  branchHasFixup,
  createCommitStatus
} = require('../github')

const { log, logEvent } = require('../logging')

/* POST Github hook
 * Accepts a webhook call from Github details a Git Push.
 * Analyses the push and sets a status to indicate if the
 * branch if belongs to has a fixup commit
 * 'success' indicates no fixups
 * 'failure' indicates branch contains a fixup
*/
async function postHook (req, res, next) {
  try {
    const eventType = get(req, 'headers.x-github-event', 'n/a')

    if (eventType !== 'push') {
      log({ text: `Invalid event, ignoring: ${eventType}` })
      return res.status(202).send('Invalid event, ignoring')
    }

    const pushData = req.body
    const { default_branch: defaultBranch, full_name: repoName } = pushData.repository
    const branch = pushData.ref.substr(11)
    const headCommit = get(pushData, 'head_commit.id')
    const installationId = get(pushData, 'installation.id')

    if (!headCommit) {
      log({ text: 'Ignoring event, no commits to analyse' })
      return res.status(202).send('Ignoring event, no commits to analyse')
    }

    if (branch === defaultBranch) {
      log({ text: 'Ignoring event, default branch' })
      return res.status(202).send('Ignoring event, default branch')
    }

    log({ text: 'Processing hook',
      fields: {
        'Repository': repoName,
        'Branch': branch
      }
    })

    const token = await accessTokenForInstallation(installationId)
    const hasFixup = await branchHasFixup({ token, repoName, branch, defaultBranch })
    const baseStatus = { token, repoName, sha: headCommit }
    const status = hasFixup
      ? assign({}, baseStatus, { state: 'failure', description: 'Branch contains fixup!' })
      : assign({}, baseStatus, { state: 'success', description: 'No fixups found' })

    await createCommitStatus(status)

    await log({
      text: status.description,
      status: status.state,
      fields: {
        'Repository': repoName,
        'Branch': branch
      }
    })

    await logEvent(status.state)
  } catch (error) {
    await log({ error })
    return res.status(500).send(error.message)
  }

  res.status(200).send('Webhook handled successfully')
}

module.exports = { postHook }
