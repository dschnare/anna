const { exec } = require('child_process')
const GitHubApi = require('github')
const createTag = require('./lib/createTag')
const getChangelog = require('./lib/getChangelog')
const pkg = require('../package.json')

function call (cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else if (stderr) {
        reject(new Error(stderr))
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

// Create a relase on GitHub.
function createRelease (tagName, changelog) {
  const github = new GitHubApi({
    debug: false,
    protocol: 'https',
    host: 'api.github.com',
    headers: {
      'user-agent': 'GitHubReleaseScript'
    },
    timeout: 5000
  })
  github.authenticate({
    type: 'token',
    token: process.env.GITHUB_ACCESS_TOKEN_REPO
  })

  if (!pkg.repository || !pkg.repository.url) {
    throw new Error('Package must have a repository field set to an object ' +
      '{ url, type } in order to create releases on GitHub.')
  }

  const repoUrlSegments = pkg.repository.url.split('/')
  const repo = repoUrlSegments.pop()
  const owner = repoUrlSegments.pop()

  return new Promise((resolve, reject) => {
    github.repos.createRelease({
      owner,
      repo,
      tag_name: tagName,
      name: tagName,
      body: changelog,
      // If the tagName version string is of the form `vM.m.p-prereleasename`
      // then this release is a prerelease. The tag name is expected to be a
      // semver version string.
      prerelease: tagName.indexOf('-') > 0
    }, (error, result) => {
      error ? reject(error) : resolve(result)
    })
  })
}

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

  Promise.all([
    getChangelog('@latest-tag', 'HEAD', { markdown: true }),
    createTag({ nextVersion, lightweight, updatePackage, verbose: true })
  ]).then(([ changelog, version ]) => {
    console.log('Tag created', version)
    console.log('pushing created tag')
    return Promise.all([
      call(`git push origin ${version}`)
    ]).then(() => {
      return [ changelog, version ]
    })
  }).then(([ changelog, version ]) => {
    return createRelease(version, changelog)
  }).then(result => {
    console.log(`Release ${result.name} created @`, result.url)
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
