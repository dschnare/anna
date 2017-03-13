const path = require('path')
const jsAssets = require('./jsAssets')
const cssAssets = require('./cssAssets')

module.exports = function htmlAssets ({ resolveAsset = null } = {}) {
  const _jsAssets = jsAssets({ resolveAsset })
  const _cssAssets = cssAssets({ resolveAsset })
  return (sourceFile, sourceText, anna) => {
    const assets = []
    const _resolveAsset = resolveAsset || anna.resolveAsset

    // src attributes
    let pat = /src=('|")(.+?)\1/g
    let m = null
    while (m = pat.exec(sourceText)) {
      assets.push(m[2])
    }

    // srcset attributes
    pat = /srcset=('|")((?:\s*[^ ,]+ \d+(?:\.\d+)?\w+,?)+)\1/g
    const subPat = /\s*([^ ,]+) \d+(?:\.\d+)?\w+,?/g
    while (m = pat.exec(sourceText)) {
      const region = m[2]
      let subM = null
      while (subM = subPat.exec(region)) {
        assets.push(subM[1])
      }
    }

    return Promise.all([
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
    ]).then(assetFiles => assetFiles.reduce((a, b) => a.concat(b), [])).then(assetFiles => {
      const cwd = path.dirname(sourceFile)
      return Promise.all(
        assets.map(asset => _resolveAsset(asset, cwd))
      ).then(a => a.filter(Boolean)).then(files => {
        return files.concat(assetFiles)
      })
    })
  }
}
