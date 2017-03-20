const exec = require('./lib/exec')
const createReleaseTag = require('./lib/createReleaseTag')

if (require.main === module) {
  createReleaseTag({ verbose: true }).then(version => {
    console.log('Tag created', version)
    console.log('Pushing tag', version)
    return exec(`git push origin ${version}`).then(() => {
      console.log(`Tag ${version} pushed`)
    })
  }).catch(error => console.error(error))
} else {
  console.log(
    `Usage:

    node tools/releasetag

    Will increment the previous annotated tag's name based on the commits
    affecting the new tag. Also, if package.json has a version that does not
    equal the release tag's version the pacakge.json is updated and the change
    is committed and added to the changelog.
    `
  )
}
