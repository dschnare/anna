const git = require('../../git')

module.exports = function getReleaseIdentiferFromChangelog (tag, refEnd = 'HEAD') {
  return git.commit.range(tag, refEnd).then(commits => {
    let semverPart = 'patch'

    if (commits.some(commit => /breaking change/i.test(commit.body))) {
      semverPart = 'major'
    } else if (commits.some(commit => {
      return /^(feat|refactor)/.test(commit.subject)
    })) {
      semverPart = 'minor'
    }

    return semverPart
  })
}
