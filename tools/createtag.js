const exec = require('./lib/exec')
const createTag = require('./lib/createTag')
const getNextVersion = require('./lib/getNextVersion')

if (require.main === module) {
  const args = process.argv.slice(2)
  const updatePackage = args.includes('--updatePackage')
  const message = (function () {
    const k = args.findIndex(arg => arg.startsWith('--message'))
    return k >= 0
      ? args[k].split('=')[1] ||
        (args[k + 1] && args[k + 1][0] !== '-'
          ? args[k + 1]
          : null)
      : null
  }())
  const nextVersion = (function () {
    const k = args.findIndex(arg => arg.startsWith('--version'))
    return k >= 0
      ? args[k].split('=')[1] ||
        (args[k + 1] && args[k + 1][0] !== '-'
          ? args[k + 1]
          : null)
      : null
  }()) || getNextVersion()

  createTag(nextVersion, { message, updatePackage, verbose: true }).then(version => {
    console.log('Tag created', version)
    console.log('Pushing tag...', version)
    return exec(`git push origin ${version}`).then(() => {
      console.log(`Tag ${version} pushed`)
    })
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
    --message        Creates an annotated tag with this message, otherwise creates a lightweight tag with no message
    --version        The version to give the tag
    --updatePackage  Determines if package.json version should be updated to match the release version
    `
  )
}
