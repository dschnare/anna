const fs = require('fs')
const path = require('path')

function enumerateAssetPaths (assetUrl, cwd = null) {
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

module.exports = function resolveAsset (assetUrl, cwd = null) {
  if (!assetUrl) {
    return Promise.resolve({
      assetUrl: assetUrl,
      assetFile: null
    })
  }

  // Ensure the asset URL uses URL-compliant separators and ensure the asset
  // URL does not start with '/'.
  assetUrl = assetUrl.replace(/\\/g, '/')

  if (assetUrl.indexOf('//') >= 0) {
    return Promise.resolve({
      assetUrl: assetUrl,
      assetFile: null
    })
  }

  const assetFiles = enumerateAssetPaths(assetUrl, cwd)

  // Take the first asset file path that exists and is a file.
  let p = Promise.reject(null)
  while (assetFiles.length) {
    const assetFile = assetFiles.shift()
    p = p.catch(() => new Promise((resolve, reject) => {
      fs.stat(assetFile, (error, stats) => {
        error
          ? reject(error)
          : (stats.isFile()
            ? resolve({
              assetUrl: assetUrl,
              assetFile: path.resolve(assetFile)
            })
            : reject(null))
      })
    }))
  }

  return p.catch(() => ({
    assetUrl: assetUrl,
    assetFile: null
  }))
}

module.exports.enumerateAssetPaths = enumerateAssetPaths
