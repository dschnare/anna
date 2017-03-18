const { exec } = require('child_process')

function getLatestTag () {
  return new Promise((resolve, reject) => {
    const cmd = 'git describe --abbrev=0 --tags'
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

function getLatestChangeLog ({ subjectOnly = true } = {}) {
  return getLatestTag().then(tag => {
    return new Promise((resolve, reject) => {
      const cmd = `git log ${tag}..HEAD --pretty=format:"%s :: %b"`
      exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else if (stderr) {
          reject(new Error(stderr))
        } else {
          const [ subject, body ] = stdout.split(' :: ')
          if (subjectOnly) {
            return subject
          } else {
            return subject + (
              body
                ? '\n  ' + body.replace(/^\n/g, '  \n')
                : ''
            )
          }
        }
      })
    })
  })
}

module.exports = getLatestChangeLog

if (require.main === module) {
  const args = process.argv.slice(2)
  const subjectOnly = args.includes('--subjectOnly')

  getLatestChangeLog({ subjectOnly }).then(changelog => {
    console.log(changelog)
  }).catch(error => console.error(error))
}

