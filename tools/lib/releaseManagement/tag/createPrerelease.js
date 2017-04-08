const readline = require('readline')
const exec = require('../../exec')
const git = require('../../git')
const getNextPrereleaseVersion = require('../version/nextPrerelease')

module.exports = function createPrereleaseTag (name = null, { commit = 'HEAD', verbose, dry } = {}) {
  return git.branch.current().then(branch => {
    if (branch === 'develop') return
    return Promise.reject(new Error(
      'Prerelease tags can only be created from the develop branch.'
    ))
  }).then(() => {
    return name || (function () {
      verbose && console.log('Fetching remote refs so the latest tag is accurate')
      return exec('git fetch origin').then(() => {
        return getNextPrereleaseVersion({ commit })
      })
    }())
  }).then(version => {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      console.log('Tag to be created:', version)
      rl.question('Have you merged upstream changes from master into develop? [yes, no, abort] ', answer => {
        if (answer.trim().toLowerCase() === 'yes') {
          resolve()
        } else {
          reject(new Error(
            'Prerelease tag aborted because you indicated that you have not ' +
            'merged master (i.e. upstream changes) into develop'
          ))
        }
        rl.close()
      })
    }).then(() => version)
  })
  .then(version => {
    return dry ? version : git.tag.create(version, { commit })
  })
}
