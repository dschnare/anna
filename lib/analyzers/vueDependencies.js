const jsDependencies = require('./jsDependencies')
const cssDependencies = require('./cssDependencies')

module.exports = function vueDependencies ({ cssImportPaths = [] } = {}) {
  const _jsDependencies = jsDependencies()
  const _cssDependencies = cssDependencies({ paths: cssImportPaths })
  return (sourceFile, sourceText, anna) => {
    return Promise.all([
      (function () {
        const p = /<script.*?>(\s|\S)+<\/script>/g
        return Promise.all(
          (sourceText.match(p) || []).map(region => {
            return _jsDependencies(sourceFile, region, anna)
          })
        ).then(deps => deps.reduce((a, b) => a.concat(b), []))
      }()),
      (function () {
        const p = /<style.*?>(\s|\S)+<\/style>/g
        return Promise.all(
          (sourceText.match(p) || []).map(region => {
            return _cssDependencies(sourceFile, region, anna)
          })
        ).then(deps => deps.reduce((a, b) => a.concat(b), []))
      }())
    ]).then(deps => deps.reduce((a, b) => a.concat(b), []))
  }
}
