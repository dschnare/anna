const readline = require('readline')
const exec = require('../../exec')
const git = require('../../git')
const { nextEdgeReleaseVersion } = require('../version')

module.exports = function createEdgeReleaseTag (prereleaseName = 'edge', { commit = 'HEAD', verbose, dry } = {}) {
  prereleaseName = (prereleaseName || 'edge').replace(/\d+$/, '')
  return git.branch.current().then(branch => {
    // Don't allow edge releases to be created from the same branch as normal
    // prereleases are permitted to be created from. This is because the auto
    // semver incrementing will step on top of one another if an edge/prerelease
    // tag is created then the opposite tag is created. By preventing edge
    // releases on develop we mitigate this issue form happening.
    //
    // NOTE: This still could happen on other branches if the commit/branch an
    // edge release was created from were merged into another branch. Then in
    // that other branch, creating prereleases would start at 0 because the most
    // recent tag that can be reached from the branch's HEAD would be the edge
    // tag.
    //
    // Example:
    // git checkout develop
    // npm run tag-prerease --> creates v1.2.0-rc.0
    // npm run tag-prerease --> creates v1.2.0-rc.1
    // npm run tag-edge --> creates v1.2.0-edge.0
    // npm run tag-prerease --> creates v1.2.0-rc.0
    if (branch === 'develop') {
      return Promise.reject(new Error(
        'Edge release tags cannot be created from the develop branch.'
      ))
    }
  }).then(() => {
    verbose && console.log('Fetching remote refs so the latest tag is accurate')
    return exec('git fetch origin').then(() => {
      return nextEdgeReleaseVersion({ prereleaseName })
    })
  }).then(version => {
    console.log('Tag to be created:', version)
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question('Ready to live on the edge? [yes, no, abort] ', answer => {
        if (['y', 'yes'].includes(answer.toLowerCase())) {
          // Create a lightweight tag for edge releases.
          return dry
            ? resolve(version)
            : git.tag.create(version, { commit }).then(resolve, reject)
        } else {
          reject(new Error('Edge tag aborted.'))
        }
        rl.close()
      })
    })
  })
}
