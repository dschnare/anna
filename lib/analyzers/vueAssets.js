const htmlAssets = require('./htmlAssets')
const jsAssets = require('./jsAssets')
const cssAssets = require('./cssAssets')
const ScannerDarkly = require('../scanner-darkly')
const AnalyzerDarkly = require('../analyzer-darkly')

const {
  String: StringTokenReader,
  BlockComment: BlockCommentTokenReader,
  Word: WordTokenReader
} = ScannerDarkly.TokenReaders

module.exports = function vueAssets ({ resolveAsset = null } = {}) {
  const _htmlAssets = htmlAssets({ resolveAsset })
  const _jsAssets = jsAssets({ resolveAsset })
  const _cssAssets = cssAssets({ resolveAsset })
  const scanner = ScannerDarkly.create([
    StringTokenReader.create(),
    BlockCommentTokenReader.create({ delimiters: [ '<!--', '-->' ] }),
    WordTokenReader.create('style,script,template'.split(','), 'keyword'),
    WordTokenReader.create('<>/'.split(''), 'operator')
  ])

  return {
    kind: 'assets',
    analyze (sourceFile, sourceText, anna) {
      const tokens = scanner.tokenize(sourceText)
      const uncommented = AnalyzerDarkly.getUncommentedTokens(tokens)
      const $start = {}
      const $end = {}

      const templateBlocks = AnalyzerDarkly.matchExpression(uncommented, [
        { value: '<' },
        { value: 'template' },
        '*',
        { value: '>', $start },
        '*',
        { value: '<', $end },
        { value: '/' },
        { value: 'template' },
        { value: '>' }
      ])

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
          const region = templateBlocks.map(m => {
            const s = m.find(t => t.$start === $start)
            const e = m.find(t => t.$end === $end)
            return sourceText.substring(s.range.end, e.range.start)
          }).pop()
          return region && _htmlAssets.analyze(sourceFile, region, anna)
        }()),
        (function () {
          const region = scriptBlocks.map(m => {
            const s = m.find(t => t.$start === $start)
            const e = m.find(t => t.$end === $end)
            return sourceText.substring(s.range.end, e.range.start)
          }).pop()
          return region && _jsAssets.analyze(sourceFile, region, anna)
        }()),
        (function () {
          const region = styleBlocks.map(m => {
            const s = m.find(t => t.$start === $start)
            const e = m.find(t => t.$end === $end)
            return sourceText.substring(s.range.end, e.range.start)
          }).pop()
          return region && _cssAssets.analyze(sourceFile, region, anna)
        }())
      ].filter(Boolean)).then(assets => assets.reduce((a, b) => {
        return a.concat(b)
      }, [])).then(assets => {
        return assets
          .filter(Boolean)
          .reduce((uniq, asset) => {
            return uniq.find(a => {
              return a.assetFile === asset.assetFile &&
                a.assetUrl === asset.assetUrl
            }) ? uniq : uniq.concat(asset)
          }, [])
      })
    }
  }
}
