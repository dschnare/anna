const releaseManagement = require('./lib/releaseManagement')

const usage =
`Usage:

node tools/changelog [refBegin refEnd] [options]

Arguments:
refBegin    An optional ref for the start of the commit range (default @latest-tag)
refEnd      An optional ref for the end of the commit range (default HEAD)

Options:
--terse     Determines if the changelog will only contain the subject of each commit
--markdown  Determines if the changelog will be written in Markdown
`

if (require.main === module) {
  const args = process.argv.slice(2)
  const refBegin = args[0] && args[0][0] !== '-' ? args[0] : '@latest-tag'
  const refEnd = args[1] && args[1][0] !== '-' ? args[1] : 'HEAD'
  const terse = args.includes('--terse')
  const markdown = args.includes('--markdown')

  releaseManagement.changelog.get(refBegin, refEnd, { terse, markdown }).then(changelog => {
    console.log(changelog)
  }).catch(error => console.error(error))
} else {
  console.log(usage)
}
