const path = require('path')
const copyFile = require('./copyFile')

module.exports = function copyAssets (assets, outDir, { filter = null, newerOnly = true } = {}) {
  // Assets is a hash { [sourceFile]: { assetUrl, assetFile } } so we convert
  // it to an array of asset objects.
  if (!Array.isArray(assets)) {
    assets = Object.keys(assets).reduce((list, key) => {
      return list.concat(assets[key])
    }, [])
  }

  assets = assets.filter(asset => !!asset.assetFile)

  if (typeof filter === 'function') {
    assets = assets.filter(({ assetUrl, assetFile }) => {
      return filter(assetUrl, assetFile)
    })
  }

  return Promise.all(
    assets.map(({ assetUrl, assetFile }) => {
      const destFile = path.join(outDir, assetUrl)
      return copyFile(assetFile, destFile, { newerOnly })
    })
  )
}
