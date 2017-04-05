const fs = require('fs')
const path = require('path')
const { Asset } = require('./Asset')
const enumerateAssetPaths = require('./enumerateAssetPaths')

module.exports = function resolveAsset (assetUrl, cwd = null) {
  if (!assetUrl) {
    return Promise.resolve(Asset.create(assetUrl))
  }

  // Ensure the asset URL uses URL-compliant separators.
  assetUrl = assetUrl.replace(/\\/g, '/')

  if (assetUrl.indexOf('//') >= 0) {
    return Promise.resolve(Asset.create(assetUrl))
  }

  const assetFiles = enumerateAssetPaths(assetUrl, cwd)

  // Take the first asset file path that exists and is a file.
  let p = Promise.reject(new Error())
  while (assetFiles.length) {
    const assetFile = assetFiles.shift()
    p = p.catch(() => new Promise((resolve, reject) => {
      fs.stat(assetFile, (error, stats) => {
        error
          ? reject(error)
          : (stats.isFile()
            ? resolve(Asset.create(assetUrl, path.resolve(assetFile)))
            : reject(new Error()))
      })
    }))
  }

  return p.catch(() => (Asset.create(assetUrl)))
}

module.exports.enumerateAssetPaths = enumerateAssetPaths
