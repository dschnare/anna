const parseSemver = require('./parse')

module.exports = function bump (versionString, { semverPart = 'patch' } = {}) {
  const version = parseSemver(versionString)

  switch (semverPart) {
    case 'major':
      version.major += 1
      version.minor = 0
      version.patch = 0
      version.prerelease = ''
      break
    case 'minor':
      version.minor += 1
      version.patch = 0
      version.prerelease = ''
      break
    case 'patch':
      version.patch += 1
      version.prerelease = ''
      break
    case 'prerelease':
      if (version.prerelease) {
        let [ prerelease, v ] = /(.+?)-*(\d+$)/.exec(version.prerelease) || []
        v = parseInt(v, 10)
        if (isNaN(v)) v = 1
        v += 1
        version.prerelease = `${prerelease}${v}`
      } else {
        version.prerelease = `rc0`
      }
      break
  }

  const v = version
  return [
    `v${v.major}.${v.minor}.${v.patch}`,
    v.prerelease
  ].filter(Boolean).join('-')
}
