const fs = require('fs')
const path = require('path')
const os = require('os')
const exec = require('./exec')
const createTag = require('./createTag')
const getChangelog = require('./getChangelog')
const getNextReleaseVersion = require('./getNextReleaseVersion')
const getCurrentBranch = require('./getCurrentBranch')

module.exports = function createReleaseTag ({ commit = 'HEAD', verbose } = {}) {
  return getCurrentBranch().then(branch => {
    if (branch === 'master') return
    return Promise.reject(new Error(
      'Release tags can only be created from the master branch.'
    ))
  }).then(() => {
    return getNextReleaseVersion({ commit }).then(version => {
      const pkg = require(path.resolve('package.json'))

      if (pkg.version !== version.replace(/^v/, '')) {
        pkg.version = version.replace(/^v/, '')

        const jsonText = JSON.stringify(pkg, null, 2)
        fs.writeFileSync(path.resolve('package.json'), jsonText, 'utf8')
        verbose && console.log('package.json version updated to', pkg.version)

        return exec('git add package.json').then(() => {
          return exec('git commit -m "chore(package): Bump version"')
        }).then(() => {
          return version
        })
      } else {
        return version
      }
    })
  }).then(version => {
    return getChangelog().then(changelog => {
      return { changelog, version }
    })
  }).then(({ changelog, version }) => {
    const changelogFile = path.join(
      os.tmpdir(),
      process.pid + '-changelog-' + version
    )
    return new Promise((resolve, reject) => {
      fs.writeFile(changelogFile, changelog, 'utf8', error => {
        error ? reject(error) : resolve({
          changelogFile, version
        })
      })
    })
  }).then(({ changelogFile, version }) => {
    return createTag(version, { message: changelogFile, commit })
      .then(() => ({ changelogFile, version }))
  }).then(({ changelogFile, version }) => {
    return new Promise((resolve, reject) => {
      fs.unlink(changelogFile, error => error ? reject(error) : resolve())
    }).then(() => version)
  })
}
