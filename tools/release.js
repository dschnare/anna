const createTag = require('./lib/createTag')

if (require.main === module) {
  const args = process.argv.slice(2)
  const lightweight = args.includes('--lightweight')
  const updatePackage = args.includes('--updatePackage')
  const nextVersion = (function () {
    const k = args.findIndex(arg => arg.startsWith('--version'))
    return k >= 0
      ? args[k].split('=')[1] ||
        (args[k + 1] && args[k + 1][0] !== '-'
          ? args[k + 1]
          : null)
      : null
  }())

  createTag({ nextVersion, lightweight, updatePackage }).then(result => {
    console.log('Tag created', result.version)
    console.log(result.changelog)
  }).catch(error => console.error(error))
} else {
  console.log(
    `Usage:

    node tools/release [options]

    By default will increment the previous tag's semver based on the commits
    affecting the new tag, unless a version is specified at the command line.

    If --updatePackage is specified then the release tool will update the
    version key in package.json and stage the change then commit it before
    creating the release tag. This will only occur if the package version does
    not match the released tag version.

    Echos the tag version and the full changelog.

    Options:
    --lightweight    Creates a lightweight tag
    --version        The version to give the tag
    --updatePackage  Determines if package.json version should be updated to match the release version
    `
  )
}
