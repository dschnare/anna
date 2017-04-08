const fs = require('fs')
const path = require('path')
const semver = require('semver')
const git = require('../../git')
const getReleaseIdentiferFromChangelog = require('./getReleaseIdentiferFromChangelog')

module.exports = function nextPrereleaseVersion ({ commit = 'HEAD' } = {}) {
  // Finds the most recent tag (annotated or lightweight) that is reachable from
  // the specified commit-ish and increments the prerelease. The prerelease
  // identifier is hardcoded to 'rc' (i.e. release candidate).
  return git.tag.latest({ includeLightweightTags: true }).then(tag => {
    if (tag) return tag
    const pkgText = fs.readFileSync(path.resolve('package.json'), 'utf8')
    const pkg = JSON.parse(pkgText)
    return pkg.version || '0.0.1'
  }).then(version => {
    if (semver.prerelease(version)) {
      return semver.inc(version, 'prerelease', 'rc')
    } else {
      return getReleaseIdentiferFromChangelog().then(semverPart => {
        return semver.inc(version, 'pre' + semverPart, 'rc')
      })
    }
  })
}
