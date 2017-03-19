const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const getLatestCommits = require('./getLatestCommits')
const getLatestTag = require('./getLatestTag')
const bumpVersion = require('./bumpVersion')

function call (cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else if (stderr) {
        reject(new Error(stderr))
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

module.exports = function createTag ({ nextVersion =  null, lightweight = false, updatePackage = false } = {}) {
  return getLatestCommits().then(commits => {
    let semverPart = 'patch'

    if (commits.some(commit => /breaking change/i.test(commit.body))) {
      semverPart = 'major'
    } else if (commits.some(commit => {
      return /^(feat|refactor)/.test(commit.subject)
    })) {
      semverPart = 'minor'
    }

    return nextVersion
      ? Promise.resolve(nextVersion)
      : getLatestTag().then(tag => {
        return bumpVersion(tag, { semverPart })
      }).then(nextVersion => {
        if (!updatePackage) return nextVersion
        const pkg = require(path.resolve('package.json'))
        if (pkg.version !== nextVersion) {
          pkg.version = nextVersion
          const jsonText = JSON.stringify(pkg, null, 2)
          fs.writeFileSync(path.resolve('package.json'), jsonText, 'utf8')
          call('git add package.json').then(() => {
            return call('git commit -m "chore(package): Bump version"')
          }).then(() => {
            commits.push({ subject: 'chore(package): Bump version', body: '' })
            return nextVersion
          })
        } else {
          return nextVersion
        }
      }).then(nextVersion => {
        return new Promise((resolve, reject) => {
          const messageOptions = commits.map(commit => {
            return `-m ${JSON.stringify(commit.subject)}`
          }).join(' ')
          const cmd = lightweight
            ? `git tag ${nextVersion}`
            : `git tag -a ${nextVersion} ${messageOptions}`
          exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
              reject(error)
            } else if (stderr) {
              reject(new Error(stderr))
            } else {
              resolve({
                version: nextVersion,
                changelog: commits.map(commit => {
                  return commit.subject + (
                    commit.body ? '\n' + commit.body : ''
                  )
                }).join('\n\n')
              })
            }
          })
        })
      })
  })
}
