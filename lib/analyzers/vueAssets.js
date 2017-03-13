const htmlAssets = require('./htmlAssets')
const jsAssets = require('./jsAssets')
const cssAssets = require('./cssAssets')

module.exports = function vueAssets ({ resolveAsset = null } = {}) {
  const _htmlAssets = htmlAssets({ resolveAsset })
  const _jsAssets = jsAssets({ resolveAsset })
  const _cssAssets = cssAssets({ resolveAsset })
  return (sourceFile, sourceText, anna) => {
    return Promise.all([
      (function () {
        const p = /<template.*?>(\s|\S)+<\/template>/g
        return Promise.all(
          (sourceText.match(p) || []).map(region => {
            return _htmlAssets(sourceFile, region, anna)
          })
        ).then(assetFiles => assetFiles.reduce((a, b) => a.concat(b), []))
      }()),
      (function () {
        const p = /<script.*?>(\s|\S)+<\/script>/g
        return Promise.all(
          (sourceText.match(p) || []).map(region => {
            return _jsAssets(sourceFile, region, anna)
          })
        ).then(assetFiles => assetFiles.reduce((a, b) => a.concat(b), []))
      }()),
      (function () {
        const p = /<style.*?>(\s|\S)+<\/style>/g
        return Promise.all(
          (sourceText.match(p) || []).map(region => {
            return _cssAssets(sourceFile, region, anna)
          })
        ).then(assetFiles => assetFiles.reduce((a, b) => a.concat(b), []))
      }())
    ]).then(assetFiles => assetFiles.reduce((a, b) => a.concat(b), []))
  }
}
