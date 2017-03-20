const fs = require('fs')
const path = require('path')
const exec = require('../../exec')
const git = require('../../git')
const semver = require('../../semver')

module.exports = function createEdgeReleaseTag (prereleaseName = 'edge', { commit = 'HEAD', verbose } = {}) {
  prereleaseName = (prereleaseName || 'edge').replace(/\d+$/, '')
  return git.branch.current().then(branch => {
    if (branch === 'master') {
      return Promise.reject(new Error(
        'Edge release tags cannot be created from the master branch.'
      ))
    }
  }).then(() => {
    verbose && console.log('Fetching remote refs so the latest tag is accurate')
    return exec('git fetch origin').then(() => {
      return git.tag.latest({ includeLightweightTags: true }).then(tag => {
        if (tag) return tag
        const pkgText = fs.readFileSync(path.resolve('package.json'), 'utf8')
        const pkg = JSON.parse(pkgText)
        return pkg.version
      })
    })
  }).then(version => {
    return semver.bump(version, { semverPart: 'prerelease' })
      .replace(/-\w+?(\d+)$/, '-' + prereleaseName + '$1')
  }).then(version => {
    return git.tag.create(version, { commit })
  })
}
