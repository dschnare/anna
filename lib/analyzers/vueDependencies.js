const jsDependencies = require('./jsDependencies')
const cssDependencies = require('./cssDependencies')
const ScannerDarkly = require('../scanner-darkly')
const AnalyzerDarkly = require('../analyzer-darkly')

const {
  String: StringTokenReader,
  BlockComment: BlockCommentTokenReader,
  Word: WordTokenReader
} = ScannerDarkly.TokenReaders

const scanner = ScannerDarkly.create([
  StringTokenReader.create(),
  BlockCommentTokenReader.create({ delimiters: [ '<!--', '-->' ] }),
  WordTokenReader.create('style,script'.split(','), 'keyword'),
  WordTokenReader.create('<>/'.split(''), 'operator')
])

module.exports = function vueDependencies ({ cssImportPaths = [] } = {}) {
  const _jsDependencies = jsDependencies()
  const _cssDependencies = cssDependencies({ paths: cssImportPaths })

  return {
    kind: 'dependencies',
    analyze (sourceFile, sourceText, anna) {
      const tokens = scanner.tokenize(sourceText)
      const uncommented = AnalyzerDarkly.getUncommentedTokens(tokens)
      const $start = {}
      const $end = {}

      const scriptBlocks = AnalyzerDarkly.matchExpression(uncommented, [
        { value: '<' },
        { value: 'script' },
        '*',
        { value: '>', $start },
        '*',
        { value: '<', $end },
        { value: '/' },
        { value: 'script' },
        { value: '>' }
      ])

      const styleBlocks = AnalyzerDarkly.matchExpression(uncommented, [
        { value: '<' },
        { value: 'style' },
        '*',
        { value: '>', $start },
        '*',
        { value: '<', $end },
        { value: '/' },
        { value: 'style' },
        { value: '>' }
      ])

      return Promise.all([
        (function () {
          const region = scriptBlocks.map(m => {
            const s = m.find(t => t.$start === $start)
            const e = m.find(t => t.$end === $end)
            return sourceText.substring(s.range.end, e.range.start)
          }).pop()
          return region && _jsDependencies.analyze(sourceFile, region, anna)
        }()),
        (function () {
          const region = styleBlocks.map(m => {
            const s = m.find(t => t.$start === $start)
            const e = m.find(t => t.$end === $end)
            return sourceText.substring(s.range.end, e.range.start)
          }).pop()
          return region && _cssDependencies.analyze(sourceFile, region, anna)
        }())
      ].filter(Boolean))
      .then(deps => deps.reduce((a, b) => a.concat(b), []))
      .then(deps => {
        return deps.reduce((uniq, dep) => {
          return uniq.includes(dep) ? uniq : uniq.concat(dep)
        }, [])
      })
    }
  }
}
