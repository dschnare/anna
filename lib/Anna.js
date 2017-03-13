const fs = require('fs')
const path = require('path')
const set = require('./set')

exports.Anna = {
  create () {
    return Object.create(this).init()
  },
  init () {
    this._analyzers = []
    return this
  },
  use (resultPath, sourceFileTest, analyze) {
    if (!(sourceFileTest instanceof RegExp ||
        typeof sourceFileTest === 'string' ||
        typeof sourceFileTest === 'function')) {
      throw new Error('Invalid source file test.')
    }
    this._analyzers.push({
      analyze,
      path: resultPath,
      test: (sourceFile) => {
        if (sourceFileTest instanceof RegExp) {
          return sourceFileTest.test(sourceFile)
        } else if (typeof sourceFileTest === 'string') {
          return sourceFile.indexOf(sourceFileTest) >= 0
        } else {
          return sourceFileTest(sourceFile)
        }
      }
    })
    return this
  },
  willAnalyze (sourceFile) {
    return this._analyzers.some(({ test }) => test(sourceFile))
  },
  analyze (sourceFiles) {
    const anna = this
    sourceFiles = [].concat(sourceFiles)
      .filter(Boolean)
      .map(sourceFile => path.resolve(sourceFile))

    return Promise.all(
      sourceFiles.map(sourceFile => {
        const analyzers = this._analyzers.filter(({ test }) => test(sourceFile))
        return { sourceFile, analyzers }
      })
      .filter(({ analyzers }) => analyzers.length > 0)
      .map(({ sourceFile, analyzers }) => {
        return new Promise((resolve, reject) => {
          fs.readFile(sourceFile, 'utf8', (error, sourceText) => {
            error
              ? reject(error)
              : resolve({ sourceFile, sourceText, analyzers })
          })
        })
      })
    ).then(results => {
      const analyzeResult = {}
      return Promise.all(
        results.map(({ sourceFile, sourceText, analyzers }) => {
          return Promise.all(
            analyzers.map(({ path, analyze }) => {
              return analyze(sourceFile, sourceText, anna).then(value => {
                set(
                  analyzeResult,
                  path.replace(/\$\{\s*sourceFile\s*\}/g,
                  sourceFile),
                  value
                )
              })
            })
          )
        })
      ).then(() => analyzeResult)
    })
  }
}
