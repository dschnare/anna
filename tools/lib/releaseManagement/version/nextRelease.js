const path = require('path')
const fs = require('fs')
const git = require('../../git')
const semver = require('../../semver')

function bumpTagVersion (tag, refEnd = 'HEAD') {
  return git.commit.range(tag, refEnd).then(commits => {
    let semverPart = 'patch'

    if (commits.some(commit => /breaking change/i.test(commit.body))) {
      semverPart = 'major'
    } else if (commits.some(commit => {
      return /^(feat|refactor)/.test(commit.subject)
    })) {
      semverPart = 'minor'
    }

    return semver.bump(tag, { semverPart })
  })
}

module.exports = function nextReleaseVersion ({ commit = 'HEAD' } = {}) {
  return git.tag.latest().then(tag => {
    if (tag) {
      return bumpTagVersion(tag, commit)
    } else {
      const pkgFile = path.resolve('package.json')
      const pkgText = fs.readFileSync(pkgFile, 'utf8')
      const pkg = JSON.parse(pkgText)
      return (pkg.version || '0.0.1').replace(/-.+$/, '')
    }
  })
}
