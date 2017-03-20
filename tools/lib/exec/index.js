const { exec } = require('child_process')

module.exports = function (cmd, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: cwd || process.cwd() }, (error, stdout, stderr) => {
      stderr = (stderr || '').trim()
      stdout = (stdout || '').trim()

      if (error) {
        console.log('error.code', error.code)
        reject(stderr ? new Error(stderr) : error)
      } else {
        resolve(stdout)
      }
    })
  })
}
