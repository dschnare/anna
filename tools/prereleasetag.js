const exec = require('./lib/exec')
const createPrereleaseTag = require('./lib/createPrereleaseTag')

if (require.main === module) {
  createPrereleaseTag().then(version => {
    console.log('Tag created', version)
    console.log('Pushing tag', version)
    return exec(`git push origin ${version}`).then(() => {
      console.log(`Tag ${version} pushed`)
    })
  })
  .catch(error => console.error(error))
} else {
  console.log(
    `Usage:

    node tools/prereleasetag
    `
  )
}
