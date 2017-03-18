const { exec } = require('child_process')
const getLatestCommits = require('./lib/getLatestCommits')
const getLatestTag = require('./lib/getLatestTag')
const bumpVersion = require('./lib/bumpVersion')

module.exports = function createTag ({ nextVersion =  null, lightweight = false } = {}) {
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
