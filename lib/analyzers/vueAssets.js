const htmlAssets = require('./htmlAssets')
const jsAssets = require('./jsAssets')
const cssAssets = require('./cssAssets')

module.exports = function vueAssets ({ resolveAsset = null } = {}) {
  const _htmlAssets = htmlAssets({ resolveAsset })
  const _jsAssets = jsAssets({ resolveAsset })
  const _cssAssets = cssAssets({ resolveAsset })

  return {
    kind: 'assets',
    analyze (sourceFile, sourceText, anna) {
      return Promise.all([
        (function () {
          const p = /<template.*?>(\s|\S)+<\/template>/g
          return Promise.all(
            (sourceText.match(p) || []).map(region => {
              return _htmlAssets.analyze(sourceFile, region, anna)
            })
          ).then(assets => assets.reduce((a, b) => a.concat(b), []))
        }()),
        (function () {
          const p = /<script.*?>(\s|\S)+<\/script>/g
          return Promise.all(
            (sourceText.match(p) || []).map(region => {
              return _jsAssets.analyze(sourceFile, region, anna)
            })
          ).then(assets => assets.reduce((a, b) => a.concat(b), []))
        }()),
        (function () {
          const p = /<style.*?>(\s|\S)+<\/style>/g
          return Promise.all(
            (sourceText.match(p) || []).map(region => {
              return _cssAssets.analyze(sourceFile, region, anna)
            })
          ).then(assets => assets.reduce((a, b) => a.concat(b), []))
        }())
      ]).then(assets => assets.reduce((a, b) => {
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
