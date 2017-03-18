const parseSemver = require('./parseSemver')

module.exports = function bumpVersion (versionString, { semverPart = 'patch' } = {}) {
  const version = parseSemver(versionString)

  switch (semverPart) {
    case 'major':
      version.major += 1
      version.minor = 0
      version.patch = 0
      break
    case 'minor':
      version.minor += 1
      version.patch = 0
      break
    case 'patch':
      version.patch += 1
      break
  }

  const v = version
  return `v${v.major}.${v.minor}.${v.patch}${v.prerelease ? '-' : ''}${v.prerelease}`
}
