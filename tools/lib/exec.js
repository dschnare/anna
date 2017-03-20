const { exec } = require('child_process')

module.exports = function (cmd, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: cwd || process.cwd() }, (error, stdout, stderr) => {
      if (stderr.trim()) {
        reject(new Error(stderr.trim()))
      } else if (error) {
        reject(error)
      } else {
        resolve(stdout.trim())
      }
    })
  })
}
