const { exec } = require('child_process')
const getLatestCommits = require('./getLatestCommits')

module.exports = function getLatestChangelog ({ subjectOnly = false } = {}) {
  return getLatestCommits().then(commits => {
    if (subjectOnly) {
      return commits.map(commit => commit.subject).join('\n')
    } else {
      return commits.map(commit => {
        return commit.subject + (
          commit.body ? '\n' + commit.body : ''
        )
      }).join('\n\n')
    }
  })
}
