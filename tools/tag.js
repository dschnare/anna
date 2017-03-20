const exec = require('./lib/exec')
const releaseManagement = require('./lib/releaseManagement')

if (require.main === module) {
  const args = process.argv.slice(2)
  const commit = args[0] && args[0][0] !== '-' ? args[0] : 'HEAD'
  const noPush = args.includes('--noPush')
  const release = args.includes('--release')
  const prerelease = args.includes('--prerelease')
  const name = (function () {
    const k = args.findIndex(arg => arg.startsWith('--name'))
    return k >= 0 ? args[k].split('=')[1] || args[k + 1] : ''
  }())

  const createTag = prerelease
    ? releaseManagement.tag.createPrerelease
    : (release
      ? releaseManagement.tag.createRelease
      : releaseManagement.tag.createEdgeRelease
    )

  createTag(name, { commit, verbose: true }).then(version => {
    console.log('Tag created', version)
    if (!noPush) {
      console.log('Pushing tag', version)
      return exec(`git push origin ${version}`).then(() => {
        console.log(`Tag ${version} pushed`)
      })
    }
  })
  .catch(error => console.error(error))
} else {
  console.log(
    `Usage:

    node tools/tag [commit] [options]

    Arguments:
    commit        The commit to point the tag at (default HEAD)

    Options:
    --name        The name given to the the tag (if specified then overrides any automatic version bumping)
    --noPush      When set, the created tag will not be pushed
    --edge        Creates an edge tag (default)
    --release     Creates a release tag
    --prerelease  Creates a prerelease tag (i.e. release candidate)
    `
  )
}
