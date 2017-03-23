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
          const region = (sourceText.match(p) || []).pop()
          return region && _htmlAssets.analyze(sourceFile, region, anna)
        }()),
        (function () {
          const p = /<script.*?>(\s|\S)+<\/script>/g
          const region = (sourceText.match(p) || []).pop()
          return region && _jsAssets.analyze(sourceFile, region, anna)
        }()),
        (function () {
          const p = /<style.*?>(\s|\S)+<\/style>/g
          const region = (sourceText.match(p) || []).pop()
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
