const path = require('path')
const jsAssets = require('./jsAssets')
const cssAssets = require('./cssAssets')
const ScannerDarkly = require('../scanner-darkly')
const AnalyzerDarkly = require('../analyzer-darkly')

const {
  String: StringTokenReader,
  BlockComment: BlockCommentTokenReader,
  Word: WordTokenReader
} = ScannerDarkly.TokenReaders

module.exports = function htmlAssets ({ resolveAsset = null } = {}) {
  const _jsAssets = jsAssets({ resolveAsset })
  const _cssAssets = cssAssets({ resolveAsset })
  const scanner = ScannerDarkly.create([
    StringTokenReader.create(),
    BlockCommentTokenReader.create({ delimiters: [ '<!--', '-->' ] }),
    WordTokenReader.create('src,srcset,style,script'.split(','), 'keyword'),
    WordTokenReader.create('<>/'.split(''), 'operator')
  ])

  return {
    kind: 'assets',
    analyze (sourceFile, sourceText, anna) {
      const _resolveAsset = resolveAsset || anna.resolveAsset
      const tokens = scanner.tokenize(sourceText)
      const uncommented = AnalyzerDarkly.getUncommentedTokens(tokens)
      const $start = {}
      const $end = {}

      const srcAttrs = AnalyzerDarkly.matchExpression(uncommented, [
        { value: 'src' },
        { type: 'string' }
      ])

      const srcsetAttrs = AnalyzerDarkly.matchExpression(uncommented, [
        { value: 'srcset' },
        { type: 'string' }
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

      let assetUrls = srcAttrs.map(m => m[1].value)

      const pat = /\s*([^ ,]+) \d+(?:\.\d+)?\w+,?/g
      srcsetAttrs.map(m => m[1].value).forEach(srcset => {
        let m = null
        pat.lastIndex = 0
        while ((m = pat.exec(srcset))) {
          assetUrls.push(m[1])
        }
      })

      const cwd = path.dirname(sourceFile)
      return Promise.all([
        Promise.all(
          assetUrls
            .filter(Boolean)
            .reduce((uniq, assetUrl) => {
              return uniq.includes(assetUrl) ? uniq : uniq.concat(assetUrl)
            }, [])
            .map(assetUrl => _resolveAsset(assetUrl, cwd))
        ),
        (function () {
          return Promise.all(
            scriptBlocks.map(m => {
              const s = m.find(t => t.$start === $start)
              const e = m.find(t => t.$end === $end)
              return sourceText.substring(s.range.end, e.range.start)
            }).map(region => {
              return _jsAssets.analyze(sourceFile, region, anna)
            })
          ).then(assetFiles => assetFiles.reduce((a, b) => a.concat(b), []))
        }()),
        (function () {
          return Promise.all(
            styleBlocks.map(m => {
              const s = m.find(t => t.$start === $start)
              const e = m.find(t => t.$end === $end)
              return sourceText.substring(s.range.end, e.range.start)
            }).map(region => {
              return _cssAssets.analyze(sourceFile, region, anna)
            })
          ).then(assetFiles => assetFiles.reduce((a, b) => a.concat(b), []))
        }())
      ]).then(assetFilesList => assetFilesList.reduce((a, b) => {
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
