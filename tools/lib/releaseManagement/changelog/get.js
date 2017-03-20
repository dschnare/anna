const git = require('../../git')

module.exports = function getChangelog (refBegin = '@latest-tag', refEnd = 'HEAD', { terse, markdown } = {}) {
  return git.commit.range(refBegin, refEnd).then(commits => {
    const nl = markdown ? '\n' : ''
    if (terse) {
      return commits.map(commit => commit.subject).join('\n' + nl)
    } else {
      return commits.map(commit => {
        return commit.subject + (
          commit.body ? '\n' + nl + commit.body : ''
        )
      }).join('\n\n')
    }
  }).then(changelog => {
    if (markdown) {
      return changelog.replace(/(\w+\([^)]+\)\s*:)\s*(.+?)(?:\n|$)/g, (_, head, tail) => {
        return `**${head}** _${tail}_\n`
      })
    } else {
      return changelog
    }
  })
}
