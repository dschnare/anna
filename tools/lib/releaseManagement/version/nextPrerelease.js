const fs = require('fs')
const path = require('path')
const semver = require('../../semver')
const git = require('../../git')
const nextReleaseVersion = require('./nextRelease')

module.exports = function nextPrereleaseVersion ({ commit = 'HEAD' } = {}) {
  return git.tag.latest({ includeLightweightTags: true }).then(tag => {
    if (tag) return tag
    const pkg = fs.readFileSync(path.resolve('package.json'), 'utf8')
    return pkg.version || '0.0.1'
  }).then(version => {
    if (semver.parse(version).prerelease) {
      return version
    } else {
      return nextReleaseVersion({ commit })
    }
  }).then(version => {
    return semver.bump(version, { semverPart: 'prerelease' })
  })
}
