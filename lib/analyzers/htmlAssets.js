const path = require('path')

module.exports = function htmlAssets ({ resolveAsset = null } = {}) {
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

    const cwd = path.dirname(sourceFile)
    return Promise.all(
      assets.map(asset => _resolveAsset(asset, cwd))
    ).then(assetFiles => assetFiles.filter(Boolean))
  }
}
