const fs = require('fs')
const path = require('path')
const exec = require('./exec')

module.exports = function createTag (version, { message, updatePackage, verbose } = {}) {
  let p = Promise.resolve(version)
  const pkg = require(path.resolve('package.json'))

  if (updatePackage && pkg.version !== version.replace(/^v/, '')) {
    pkg.version = version.replace(/^v/, '')

    const jsonText = JSON.stringify(pkg, null, 2)
    fs.writeFileSync(path.resolve('package.json'), jsonText, 'utf8')
    verbose && console.log('package.json version updated to', pkg.version)

    p = exec('git add package.json').then(() => {
      return exec('git commit -m "chore(package): Bump version"')
    }).then(() => {
      return version
    })
  }

  return p.then(version => {
    const cmd = message
      ? `git tag -a ${version} -m ${JSON.stringify(message)}`
      : `git tag ${version}`
    return exec(cmd).then(() => version)
  })
}
