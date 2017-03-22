const fs = require('fs')
const path = require('path')
const set = require('./set')
const resolveAsset = require('./resolveAsset')
const makeRecursiveAnalyzer = require('./makeRecursiveAnalyzer')

exports.Anna = {
  resolveAsset,
  create () {
    return Object.create(this).init()
  },
  init () {
    this._analyzers = []
    return this
  },
  use (resultPath, sourceFileTest, analyzer) {
    if (!(sourceFileTest instanceof RegExp ||
        typeof sourceFileTest === 'string' ||
        typeof sourceFileTest === 'function')) {
      throw new Error('Invalid source file test.')
    }

    const test = (sourceFile) => {
      if (sourceFileTest instanceof RegExp) {
        return sourceFileTest.test(sourceFile)
      } else if (typeof sourceFileTest === 'string') {
        return sourceFile.indexOf(sourceFileTest) >= 0
      } else {
        return sourceFileTest(sourceFile)
      }
    }

    const kind = analyzer.kind || 'any'
    analyzer = typeof analyzer === 'function' ? { analyze: analyzer } : analyzer
    analyzer = Object.assign(
      Object.create(analyzer), { test, path: resultPath, kind }
    )
    analyzer = makeRecursiveAnalyzer(analyzer)
    this._analyzers.push(analyzer)

    return this
  },
  willAnalyze (sourceFile) {
    return this._analyzers.some(({ test }) => test(sourceFile))
  },
  findAnalyzers (sourceFile) {
    return this._analyzers.filter(({ test }) => test(sourceFile))
  },
  analyze (sourceFiles) {
    const anna = this
    sourceFiles = [].concat(sourceFiles)
      .filter(Boolean)
      .map(sourceFile => path.resolve(sourceFile))

    // Exit early if we can.
    if (sourceFiles.length === 0) {
      return Promise.resolve({})
    }

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
      return Promise.all(
        results.map(({ sourceFile, sourceText, analyzers }) => {
          return Promise.all(
            analyzers.map(({ path, analyze }) => {
              return analyze(sourceFile, sourceText, anna).then(value => {
                // Resolve to arguments that will be passed to set() so that we
                // can aggregate all calls in the future so that hey are merged
                // into the result object in the order they appeared in the
                // arguments list when analyze() was called.
                return [
                  path.replace(/\$\{\s*sourceFile\s*\}/g, sourceFile), value
                ]
              })
            })
          ).then(a => a.reduce((a, b) => a.concat(b), []))
        })
      ).then(argsList => {
        const analyzeResult = {}
        argsList.forEach(args => {
          set.apply(undefined, [ analyzeResult ].concat(args))
        })
        return analyzeResult
      })
    })
  }
}
