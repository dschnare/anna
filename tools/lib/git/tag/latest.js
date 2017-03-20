const exec = require('../../exec')

module.exports = function latestTag ({ includeLightweightTags } = {}) {
  const tagsOption = includeLightweightTags ? '--tags' : ''
  const cmd = [ 'git describe --abbrev=0', tagsOption ].join(' ')
  return exec(cmd)
}
