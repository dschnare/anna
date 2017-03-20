const path = require('path')
const fs = require('fs')
const exec = require('./exec')
const getCommits = require('./getCommits')
const getLatestTag = require('./getLatestTag')
const bumpVersion = require('./bumpVersion')

function bumpTagVersion (tag, refEnd = 'HEAD') {
  return getCommits(tag, refEnd).then(commits => {
    let semverPart = 'patch'

    if (commits.some(commit => /breaking change/i.test(commit.body))) {
      semverPart = 'major'
    } else if (commits.some(commit => {
      return /^(feat|refactor)/.test(commit.subject)
    })) {
      semverPart = 'minor'
    }

    return bumpVersion(tag, { semverPart })
  })
}

module.exports = function getNextVersion ({ commit = 'HEAD' } = {}) {
  return exec('git fetch origin').then(() => {
    return getLatestTag().then(tag => {
      if (tag) {
        return bumpTagVersion(tag, commit)
      } else {
        const pkgFile = path.resolve('package.json')
        const pkgText = fs.readFileSync(pkgFile, 'utf8')
        const pkg = JSON.parse(pkgText)
        return pkg.version.replace(/-.+$/, '')
      }
    })
  })
}
