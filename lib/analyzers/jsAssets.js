const path = require('path')

module.exports = function jsAssets ({ resolveAsset = null } = {}) {
  return (sourceFile, sourceText, anna) => {
    const assets = []
    const _resolveAsset = resolveAsset || anna.resolveAsset

    const pat = /('|")(.+?(?:\/[^/]+?)*\.\w+)\1/g
    let m = null
    while (m = pat.exec(sourceText)) {
      assets.push(m[2])
    }

    const cwd = path.dirname(sourceFile)
    return Promise.all(
      assets.map(asset => _resolveAsset(asset, cwd))
    ).then(assetFiles => assetFiles.filter(Boolean))
  }
}
