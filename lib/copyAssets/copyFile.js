const fs = require('fs')
const path = require('path')
const mkdir = require('./mkdir')

function stat (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (error, stats) => error ? reject(error) : resolve(stats))
  })
}

module.exports = function copyFile (srcFile, destFile, { newerOnly = false } = {}) {
  let p = Promise.resolve(true)
  if (newerOnly) {
    p = Promise.all([
      stat(srcFile),
      stat(destFile)
    ]).then(([ srcStats, destStats ]) => {
      return srcStats.mtime.getTime() > destStats.mtime.getTime()
    })
  }

  return p.then(shouldCopy => {
    return shouldCopy && mkdir(path.dirname(destFile)).then(() => {
      return new Promise((resolve, reject) => {
        const r = fs.createReadStream(srcFile)
        const w = fs.createWriteStream(destFile)

        r.pipe(w)
          .on('error', reject)
          .on('close', resolve)
      })
    })
  })
}
