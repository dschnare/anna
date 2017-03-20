const fs = require('fs')
const path = require('path')
const bumpVersion = require('./bumpVersion')
const getLatestTag = require('./getLatestTag')
const createTag = require('./createTag')

module.exports = function createPrereleaseTag ({ commit = 'HEAD' } = {}) {
  return getLatestTag({ includeLightweightTags: true }).then(tag => {
    if (tag) return tag
    const pkgText = fs.readFileSync(path.resolve('package.json'), 'utf8')
    const pkg = JSON.parse(pkgText)
    return pkg.version
  }).then(version => {
    return bumpVersion(version, { semverPart: 'prerelease' })
  }).then(version => {
    return createTag(version, { commit })
  })
}
