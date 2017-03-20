const exec = require('./exec')

module.exports = function getCurrentBranch () {
  const cmd = 'git rev-parse --abbrev-ref HEAD'
  return exec(cmd)
}
