const fs = require('fs')
const path = require('path')
const readline = require('readline')
const exec = require('../../exec')
const git = require('../../git')
const semver = require('../../semver')

module.exports = function createEdgeReleaseTag (prereleaseName = 'edge', { commit = 'HEAD', verbose, dry } = {}) {
  prereleaseName = (prereleaseName || 'edge').replace(/\d+$/, '')
  return git.branch.current().then(branch => {
    // Should edge releases be able to be created from any branch? Why not?
    // if (branch === 'master') {
    //   return Promise.reject(new Error(
    //     'Edge release tags cannot be created from the master branch.'
    //   ))
    // }
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
    console.log('Tag to be created:', version)
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question('Ready to live on the edge? [yes, no, abort] ', answer => {
        if (['y', 'yes'].includes(answer.toLowerCase())) {
          return dry
            ? resolve(version)
            : git.tag.create(version, { commit }).then(resolve, reject)
        } else {
          reject(new Error('Edge tag aborted.'))
        }
        rl.close()
      })
    })
  })
}
