const path = require('path')

module.exports = function cssAssets ({ resolveAsset = null } = {}) {
  return (sourceFile, sourceText, anna) => {
    const assets = []
    const _resolveAsset = resolveAsset || anna.resolveAsset

    // url() statements
    const pat = /url\(\s*('|")?(.+?)\1?\s*\)/g
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
