const log = require('./log')
const logEvent = require('./log_event')

module.exports = {
  log,
  logEvent,
  ERROR: 'error',
  SUCCESS: 'success',
  FAILURE: 'failure'
}
