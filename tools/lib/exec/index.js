const { exec } = require('child_process')

module.exports = function (cmd, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: cwd || process.cwd() }, (error, stdout, stderr) => {
      stderr = (stderr || '').trim()
      stdout = (stdout || '').trim()

      if (error) {
        reject(stderr ? new Error(stderr) : error)
      } else {
        resolve(stdout)
      }
    })
  })
}
