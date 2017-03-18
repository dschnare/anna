const getLatestChangelog = require('./lib/getLatestChangelog')

if (require.main === module) {
  const args = process.argv.slice(2)
  const subjectOnly = args.includes('--subjectOnly')
  getLatestChangelog({ subjectOnly }).then(changelog => {
    console.log(changelog)
  }).catch(error => console.error(error))
} else {
  console.log(
    `Usage:

    node tools/changelog [options]

    Options:
    --subjectOnly   Determines if the changelog will only contain the subject of each commit
    `
  )
}

