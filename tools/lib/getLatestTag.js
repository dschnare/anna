const { exec } = require('child_process')
const path = require('path')

module.exports = function getLatestTag () {
  return new Promise((resolve, reject) => {
    const cmd = 'git describe --abbrev=0 --tags'
    exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else if (stderr) {
        reject(new Error(stderr))
      } else {
        resolve(stdout.trim() || require(path.resolve('package.json')).version)
      }
    })
  })
}
