const path = require('path')

module.exports = function cssAssets ({ resolveAsset = null } = {}) {
  return (sourceFile, sourceText, anna) => {
    const assetFiles = []
    const _resolveAsset = resolveAsset || anna.resolveAsset

    // url() statements
    const pat = /url\(\s*('|")?(.+?)\1?\s*\)/g
    let m = null
    while ((m = pat.exec(sourceText))) {
      assetFiles.push(m[2])
    }

    const cwd = path.dirname(sourceFile)
    return Promise.all(
      assetFiles
        .filter(Boolean)
        .reduce((uniq, assetFile) => {
          return uniq.includes(assetFile) ? uniq : uniq.concat(assetFile)
        }, [])
        .map(assetFile => _resolveAsset(assetFile, cwd))
    )
  }
}
