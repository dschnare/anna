const { exec } = require('child_process')
const getLatestTag = require('./getLatestTag')

module.exports = function getLatestCommits () {
  return getLatestTag().then(tag => {
    return new Promise((resolve, reject) => {
      const cmd = `git log ${tag}..HEAD --pretty=format:"%s:::%b#END#"`
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