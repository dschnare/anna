const { exec } = require('child_process')
const getLatestTag = require('./getLatestTag')

module.exports = function getCommits (refBegin = '@latest-tag', refEnd = 'HEAD') {
  return Promise.resolve(
    refBegin === '@latest-tag' ? getLatestTag() : refBegin
  ).then(refBegin => {
    return new Promise((resolve, reject) => {
      const cmd = `git log ${refBegin}..${refEnd} --pretty=format:"%s:::%b#END#"`
      exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else if (stderr) {
          reject(new Error(stderr))
        } else {
          const parts = stdout.trim().replace(/#END#$/, '').split(/:::|#END#/)
          const commits = parts.reduce((commits, part, p) => {
            if (p % 2 === 0) {
              return commits.concat({ subject: part.trim() })
            } else {
              commits.slice(-1)[0].body = part.trim()
              return commits
            }
          }, [])

          resolve(commits)
        }
      })
    })
  })
}
