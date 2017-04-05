const path = require('path')
const jsAssets = require('./jsAssets')
const cssAssets = require('./cssAssets')

module.exports = function htmlAssets ({ resolveAsset = null } = {}) {
  const _jsAssets = jsAssets({ resolveAsset })
  const _cssAssets = cssAssets({ resolveAsset })

  return {
    kind: 'assets',
    analyze (sourceFile, sourceText, anna) {
      const assetFiles = []
      const _resolveAsset = resolveAsset || anna.resolveAsset

      // Remove comments before analyzing.
      sourceText = sourceText
        .replace(/<!--+(?:\s|\S)+?-+->/g, '')

      // src attributes
      let pat = /src=('|")(.+?)\1/g
      let m = null
      while ((m = pat.exec(sourceText))) {
        assetFiles.push(m[2])
      }

      // srcset attributes
      pat = /srcset=('|")((?:\s*[^ ,]+ \d+(?:\.\d+)?\w+,?)+)\1/g
      const subPat = /\s*([^ ,]+) \d+(?:\.\d+)?\w+,?/g
      while ((m = pat.exec(sourceText))) {
        const region = m[2]
        let subM = null
        subPat.lastIndex = 0
        while ((subM = subPat.exec(region))) {
          assetFiles.push(subM[1])
        }
      }

      const cwd = path.dirname(sourceFile)
      return Promise.all([
        Promise.all(
          assetFiles
            .filter(Boolean)
            .reduce((uniq, assetFile) => {
              return uniq.includes(assetFile) ? uniq : uniq.concat(assetFile)
            }, [])
            .map(assetFile => _resolveAsset(assetFile, cwd))
        ),
        (function () {
          const p = /<script.*?>(\s|\S)+<\/script>/g
          return Promise.all(
            (sourceText.match(p) || []).map(region => {
              return _jsAssets.analyze(sourceFile, region, anna)
            })
          ).then(assetFiles => assetFiles.reduce((a, b) => a.concat(b), []))
        }()),
        (function () {
          const p = /<style.*?>(\s|\S)+<\/style>/g
          return Promise.all(
            (sourceText.match(p) || []).map(region => {
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
