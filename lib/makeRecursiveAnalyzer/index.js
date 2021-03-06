const fs = require('fs')
const path = require('path')

/*
 * Pefroms an analyze pass.
 *
 * @private
 * @param {Object} context The context for the next analyze pass
 * @return {Promise<any[]>} All the analysis results
 */
function next (context) {
  const { analyzer, analyze, anna, cache = {} } = context
  let { allResults = [], sourceFiles } = context

  if (sourceFiles.length === 0) {
    return Promise.resolve(allResults)
  }

  const sourceFile = sourceFiles.shift()
  const sourceText = sourceFiles.shift()
  let analyzers = []
  // Only need to recurse if we use the analyze function specified in the
  // context because it won't have recursive behaviour applied to it
  // (i.e. it's the analyze function we're apply recursive behaviour to).
  let recurse = false

  if (analyzer.test(sourceFile)) {
    analyzers = [ { analyze } ]
    recurse = true
  } else {
    analyzers = anna.findAnalyzers(sourceFile).filter(a => {
      return a.kind === analyzer.kind && a !== analyzer
    })
  }

  if (analyzers.length === 0) {
    return next({ analyzer, analyze, sourceFiles, anna, cache, allResults })
  }

  return Promise.all(
    analyzers.map(analyzer => {
      return analyzer.analyze(sourceFile, sourceText, anna)
    })
  ).then(resultsList => {
    return resultsList.reduce((a, b) => a.concat(b), [])
  }).then(results => {
    const uniqueResults = results.filter(result => {
      return result !== null &&
        result !== undefined &&
        !allResults.some(r => r.toString() === result.toString())
    })
    allResults = allResults.concat(uniqueResults)

    const fileNames = uniqueResults.map(result => {
      return result.fileName || result.toString()
    }).filter(fileName => {
      return path.isAbsolute(fileName)
    }).filter(fileName => {
      return !(fileName in cache)
    })

    if (fileNames.length === 0) {
      return next({ analyzer, analyze, sourceFiles, anna, cache, allResults })
    }

    fileNames.forEach(fileName => {
      cache[fileName] = 1
    })

    // If we are recursing then we read the files and add them to the end of
    // the sourceFiles array to be analyzed in the next pass.
    if (recurse) {
      return Promise.all(
        fileNames.map(
          fileName => new Promise((resolve, reject) => {
            fs.readFile(fileName, 'utf8', (error, text) => {
              if (error) {
                if (error.code === 'ENOENT') {
                  resolve([ fileName, '' ])
                } else {
                  reject(error)
                }
              } else {
                resolve([ fileName, text ])
              }
            })
          })
        )
      ).then(sources => {
        sources.filter(([ _, sourceText ]) => {
          return !!sourceText
        }).forEach(([ sourceFile, sourceText ]) => {
          sourceFiles.push(sourceFile, sourceText)
        })

        return next({ analyzer, analyze, sourceFiles, anna, cache, allResults })
      })
    } else {
      return next({ analyzer, analyze, sourceFiles, anna, cache, allResults })
    }
  })
}

/**
 * Overrides an analyzer's analyze function so that it recursively analyzes
 * its results.
 *
 * @param {Analyzer} analyzer
 * @return {Analyzer} The overridden analyzer
 */
module.exports = function makeRecursiveAnalyzer (analyzer) {
  const analyze = analyzer.analyze
  return Object.assign(Object.create(analyzer), {
    analyze: function (sourceFile, sourceText, anna) {
      return next({
        sourceFiles: [ sourceFile, sourceText ],
        analyzer,
        analyze,
        anna
      })
    }
  })
}
