const exec = require('./exec')
const getLatestTag = require('./getLatestTag')

module.exports = function getCommits (refBegin = '@latest-tag', refEnd = 'HEAD', { noMerges = true } = {}) {
  return Promise.all([
    refBegin === '@latest-tag' ? getLatestTag() : refBegin,
    refEnd === '@latest-tag' ? getLatestTag() : refEnd
  ]).then(([ refBegin, refEnd ]) => {
    const noMergesOption = noMerges ? '--no-merges' : ''
    const cmd = `git log ${refBegin}..${refEnd} ${noMergesOption} --pretty=format:"%s:::%b#END#"`
    return exec(cmd).then(stdout => {
      const parts = stdout.trim().replace(/#END#$/, '').split(/:::|#END#/)
      return parts.reduce((commits, part, p) => {
        if (p % 2 === 0) {
          return commits.concat({ subject: part.trim() })
        } else {
          commits.slice(-1)[0].body = part.trim()
          return commits
        }
      }, [])
    })
  })
}
