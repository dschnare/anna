const path = require('path')

module.exports = function enumerateAssetPaths (assetUrl, cwd = null) {
  cwd = path.relative(process.cwd(), cwd || process.cwd())
  const assetFiles = []

  // Construct an array with all the possible locations of the asset file.
  while (cwd !== null) {
    let currAssetUrl = assetUrl.replace(/^\//, '')
    while (currAssetUrl) {
      let assetFile = path.join(cwd, currAssetUrl)
      assetFiles.push(assetFile)
      currAssetUrl = currAssetUrl
        .split('/')
        .filter(Boolean)
        .slice(1)
        .join('/')
    }
    cwd = cwd
      ? cwd.split(path.sep).filter(Boolean).slice(0, -1).join(path.sep)
      : null
  }

  return assetFiles
}
