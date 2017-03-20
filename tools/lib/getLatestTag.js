const exec = require('./exec')

module.exports = function getLatestTag () {
  const cmd = 'git describe --abbrev=0 --tags'
  return exec(cmd)
}
