const fs = require('fs')
const path = require('path')
const exec = require('./exec')
const createTag = require('./createTag')
const bumpVersion = require('./bumpVersion')
const getLatestTag = require('./getLatestTag')
const getCurrentBranch = require('./getCurrentBranch')

module.exports = function createEdgeReleaseTag (name = 'edge', { commit = 'HEAD' } = {}) {
  return getCurrentBranch().then(branch => {
    if (branch === 'master') {
      return Promise.reject(new Error(
        'Edge release tags cannot be created from the master branch.'
      ))
    }
  }).then(() => {
    return exec('git fetch origin').then(() => {
      return getLatestTag({ includeLightweightTags: true }).then(tag => {
        if (tag) return tag
        const pkgText = fs.readFileSync(path.resolve('package.json'), 'utf8')
        const pkg = JSON.parse(pkgText)
        return pkg.version
      })
    })
  }).then(version => {
    return bumpVersion(version, { semverPart: 'prerelease' })
      .replace(/-\w+?(\d+)$/, '-' + name + '$1')
  }).then(version => {
    return createTag(version, { commit })
  })
}
