const path = require('path')
const ScannerDarkly = require('../scanner-darkly')
const AnalyzerDarkly = require('../analyzer-darkly')

const {
  String: StringTokenReader,
  Comment: CommentTokenReader,
  BlockComment: BlockCommentTokenReader
} = ScannerDarkly.TokenReaders

module.exports = function jsAssets ({ resolveAsset = null } = {}) {
  return {
    kind: 'assets',
    analyze (sourceFile, sourceText, anna) {
      const _resolveAsset = resolveAsset || anna.resolveAsset
      const scanner = ScannerDarkly.create([
        StringTokenReader.create({ multilineQuote: '`' }),
        BlockCommentTokenReader.create({ delimiters: [ '/*', '*/' ] }),
        CommentTokenReader.create({ delimiter: '//' })
      ])
      const assetUrlPattern = /^\/?(?:\w|-|@|\$|_)+(?:\/(?:\w|-|@|\$|_)+?)*\.\w+$/
      const tokens = scanner.tokenize(sourceText)
      const uncommented = AnalyzerDarkly.getUncommentedTokens(tokens)
      const assetUrls = uncommented
        .filter(t => t.type === 'string')
        .map(s => s.value)
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
