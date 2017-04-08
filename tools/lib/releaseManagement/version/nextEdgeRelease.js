const fs = require('fs')
const path = require('path')
const semver = require('semver')
const git = require('../../git')

module.exports = function nextPrereleaseVersion ({ commit = 'HEAD', prereleaseName = 'edge' } = {}) {
  // Finds the most recent tag (annotated or lightweight) that is reachable from
  // the specified commit-ish and increments the prerelease.
  if (prereleaseName === 'rc') {
    return Promise.reject(new Error('Edge prerelease name cannot be "rc".'))
  }

  return git.tag.latest({ includeLightweightTags: true }).then(tag => {
    if (tag) return tag
    const pkgText = fs.readFileSync(path.resolve('package.json'), 'utf8')
    const pkg = JSON.parse(pkgText)
    return pkg.version || '0.0.1'
  }).then(version => {
    return semver.inc(version, 'prerelease', prereleaseName)
  })
}
