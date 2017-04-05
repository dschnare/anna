const path = require('path')

module.exports = function jsAssets ({ resolveAsset = null } = {}) {
  return {
    kind: 'assets',
    analyze (sourceFile, sourceText, anna) {
      const assetFiles = []
      const _resolveAsset = resolveAsset || anna.resolveAsset

      // Remove all strings.
      const strings = []
      sourceText = sourceText.replace(/('|"|`).+?\1/g, s => {
        strings.push(s)
        return `%%${strings.length - 1}%%`
      })

      // Remove comments or comment-like blocks before analyzing.
      const ext = path.extname(sourceFile)
      switch (ext) {
        case '.coffee':
          sourceText = sourceText
            .replace(/#.+?\n/g, '')
            .replace(/###\n(?:\s|\S)+?\n###/g, '')
          break
        default:
          sourceText = sourceText
            .replace(/\/\/.+?\n/g, '')
            .replace(/\/\*(?:\s|\S)+?\*\//g, '')
      }

      // Put back all strings.
      sourceText = sourceText.replace(/%%(\d+)%%/g, (_, n) => {
        return strings[parseInt(n, 10)]
      })

      const pat = /('|")(.+?(?:\/[^/]+?)*\.\w+)\1/g
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
