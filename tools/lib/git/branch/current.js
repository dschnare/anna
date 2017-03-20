const exec = require('../../exec')

module.exports = function currentBranch () {
  const cmd = 'git rev-parse --abbrev-ref HEAD'
  return exec(cmd)
}
