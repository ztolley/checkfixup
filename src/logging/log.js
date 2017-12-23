const axios = require('axios')
const { pick, get } = require('lodash')

function transposeFields (fields) {
  const fieldKeys = Object.keys(fields)

  return fieldKeys.map((key) => {
    return {
      title: key,
      value: fields[key],
      short: true
    }
  })
}

/**
 *
 * @param {*} params
 * @param {string} params.status  SUCCESS, FAILURE, ERROR
 */
async function log ({ text = '', status, fields = {}, slack = true, error }) {
  const colours = {
    error: '#D00000',
    falure: '#ff9000',
    success: '#36a64f'
  }

  const payload = !error ? {
    attachments: [{
      color: colours[status] || '#000000',
      title: `Checkfixup ${get(process.env, 'SLACK_ENV', '')}`.trim(),
      text,
      fields: transposeFields(fields)
    }]
  } : {
    attachments: [{
      color: colours['error'],
      title: `Checkfixup ${get(process.env, 'SLACK_ENV', '')}`.trim(),
      fallback: error.message,
      pretext: error.message,
      text: JSON.stringify(pick(error, ['config', 'stack', 'message']), null, '\t'),
      fields: transposeFields(fields)
    }]
  }

  if (slack && process.env.SLACK_ID) {
    const url = `https://hooks.slack.com/services/${process.env.SLACK_ID}`
    axios.post(url, payload)
  }
}

module.exports = log
