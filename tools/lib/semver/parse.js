module.exports = function parse (versionStr) {
  if (!versionStr) return { major: 0, minor: 0, patch: 0, prerelease: '' }

  let [ major, minor, ...patch ] = versionStr.split('.')
  let prerelease = ''

  major = major.replace(/^v/, '')
  patch = patch.join('.')
  prerelease = patch.indexOf('-') > 0 ? patch.substr(patch.indexOf('-') + 1) : ''
  patch = patch.split('-').shift()

  major = parseInt(major, 10)
  minor = parseInt(minor, 10)
  patch = parseInt(patch, 10)

  return {
    major, minor, patch, prerelease
  }
}