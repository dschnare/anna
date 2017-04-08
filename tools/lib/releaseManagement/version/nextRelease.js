const path = require('path')
const fs = require('fs')
const semver = require('semver')
const git = require('../../git')
const getReleaseIdentiferFromChangelog = require('./getReleaseIdentiferFromChangelog')

function bumpTagVersion (tag, refEnd = 'HEAD') {
  return getReleaseIdentiferFromChangelog(tag, refEnd).then(semverPart => {
    return semver.inc(tag, semverPart)
  })
}

module.exports = function nextReleaseVersion ({ commit = 'HEAD' } = {}) {
  // Finds the most recent tag (annotated or lightweight) that is reachable from
  // the specified commit-ish and increments it according to the commits in the
  // changelog.
  return git.tag.latest().then(tag => {
    if (tag) {
      return bumpTagVersion(tag, commit)
    } else {
      const pkgFile = path.resolve('package.json')
      const pkgText = fs.readFileSync(pkgFile, 'utf8')
      const pkg = JSON.parse(pkgText)

      if (semver.prerelease(pkg.version)) {
        return semver.inc(pkg.version, 'patch')
      } else {
        return pkg.version
      }
    }
  })
}
