const path = require('path')
const ScannerDarkly = require('../scanner-darkly')
const AnalyzerDarkly = require('../analyzer-darkly')

const {
  String: StringTokenReader,
  Comment: CommentTokenReader,
  BlockComment: BlockCommentTokenReader,
  Word: WordTokenReader
} = ScannerDarkly.TokenReaders

const scanner = ScannerDarkly.create([
  StringTokenReader.create(),
  BlockCommentTokenReader.create({ delimiters: [ '/*', '*/' ] }),
  CommentTokenReader.create({ delimiter: '//' }),
  WordTokenReader.create('()'.split(''), 'operator'),
  WordTokenReader.create('url'.split(','), 'keyword')
])
const assetUrlPattern = /^\/?(?:\w|-|@|\$|_)+(?:\/(?:\w|-|@|\$|_)+?)*\.\w+$/

module.exports = function cssAssets ({ resolveAsset = null } = {}) {
  return {
    kind: 'assets',
    analyze (sourceFile, sourceText, anna) {
      const _resolveAsset = resolveAsset || anna.resolveAsset
      const tokens = scanner.tokenize(sourceText)
      const uncommented = AnalyzerDarkly.getUncommentedTokens(tokens)

      const urlStatements = AnalyzerDarkly.matchExpression(uncommented, [
        { value: 'url' },
        { value: '(' },
        { type: 'string' },
        { value: ')' }
      ]).concat(
        AnalyzerDarkly.matchExpression(uncommented, [
          { value: 'url' },
          { value: '(' },
          { value: ')' }
        ]).map(m => {
          const range = { start: m[1].range.end, end: m[2].range.start }
          m.splice(2, 0, {
            type: 'string',
            index: range.start,
            range,
            line: m[1].line,
            column: m[1].column + 1,
            value: sourceText.substring(range.end, range.start)
          })
          return m
        })
      )

      const assetUrls = urlStatements
        .map(m => m[m.length - 2].value)
        .filter(s => assetUrlPattern.test(s))

      const cwd = path.dirname(sourceFile)
      return Promise.all(
        assetUrls
          .filter(Boolean)
          .reduce((uniq, assetUrl) => {
            return uniq.includes(assetUrl) ? uniq : uniq.concat(assetUrl)
          }, [])
          .map(assetUrl => _resolveAsset(assetUrl, cwd))
      )
    }
  }
}
