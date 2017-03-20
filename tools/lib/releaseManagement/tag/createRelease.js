const fs = require('fs')
const path = require('path')
const os = require('os')
const readline = require('readline')
const exec = require('../../exec')
const git = require('../../git')
const getChangelog = require('../changelog/get')
const getNextReleaseVersion = require('../version/nextRelease')

module.exports = function createReleaseTag ({ commit = 'HEAD', verbose } = {}) {
  return git.branch.current().then(branch => {
    if (branch === 'master') return
    return Promise.reject(new Error(
      'Release tags can only be created from the master branch.'
    ))
  }).then(() => {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question('Have you merged your branch (usually develop) into master? [yes or no] ', answer => {
        if (answer.trim().toLowerCase() === 'yes') {
          resolve()
        } else {
          reject(new Error(
            'Release tag aborted because you indicated that you have not ' +
            'merged your changes into master'
          ))
        }
        rl.close()
      })
    })
  })
  .then(() => {
    verbose && console.log('Fetching remote refs so the latest tag is accurate')
    return exec('git fetch origin').then(() => {
      return getNextReleaseVersion({ commit }).then(version => {
        const pkg = require(path.resolve('package.json'))

        if (pkg.version !== version.replace(/^v/, '')) {
          const oldVersion = pkg.version
          pkg.version = version.replace(/^v/, '')

          const jsonText = JSON.stringify(pkg, null, 2)
          fs.writeFileSync(path.resolve('package.json'), jsonText, 'utf8')
          if (verbose) {
            console.log(`package.json version updated from ${oldVersion} to ${version}`)
          }

          return exec('git add package.json').then(() => {
            return exec('git commit -m "chore(package): Bump version"')
          }).then(() => {
            return version
          })
        } else {
          return version
        }
      })
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
    return git.tag.create(version, { message: changelogFile, commit })
      .then(() => ({ changelogFile, version }))
  }).then(({ changelogFile, version }) => {
    return new Promise((resolve, reject) => {
      fs.unlink(changelogFile, error => error ? reject(error) : resolve())
    }).then(() => version)
  })
}
