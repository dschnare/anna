const path = require('path')

module.exports = function cssAssets ({ resolveAsset = null } = {}) {
  return {
    kind: 'assets',
    analyze (sourceFile, sourceText, anna) {
      const assetFiles = []
      const _resolveAsset = resolveAsset || anna.resolveAsset

      // Remove all strings.
      const strings = []
      sourceText = sourceText.replace(/('|")(?:\\\1|\s|\S)+?\1/g, s => {
        return `%%${strings.push(s)}%%`
      })

      // Remove comments before analyzing.
      sourceText = sourceText
        .replace(/\/\/.+?(?:\n|$)/g, '') // Less and Sass
        .replace(/\/\*(?:\s|\S)+?\*\//g, '') // CSS

      // Put back all strings.
      sourceText = sourceText.replace(/%%(\d+)%%/g, (_, n) => {
        return strings[parseInt(n, 10) - 1]
      })

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
}
