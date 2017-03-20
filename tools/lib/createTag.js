const fs = require('fs')
const exec = require('./exec')

module.exports = function createTag (name, { message, commit = 'HEAD' } = {}) {
  const messageOption = message && fs.existsSync(message)
    ? `-F ${JSON.stringify(message)}`
    : (message
      ? `-m ${JSON.stringify(message)}`
      : ''
    )
  const cmd = [
    'git tag', messageOption, `${name} ${commit}`
  ].join(' ')
  return exec(cmd).then(() => name).then(() => name)
}
