const fs = require('fs')
const path = require('path')

/*
Where options is a hash of file extensions and their getDependencies function.
If a source file extension has a key in the options hash then that function will
be used to get the dependencies from that file. Otherwise the getDependencies
function passed in will be used. This is useful if say your source file can
import/require source files of a different type (i.e. .js imported .vue files).
*/
module.exports = function makeRecursiveDependencyAnalyzer (getDependencies, options = {}) {
  return function (sourceFile, sourceText) {
    const sourceFiles = [ sourceFile, sourceText ]

    const next = (allDeps = []) => {
      if (sourceFiles.length) {
        const sourceText = sourceFiles.pop()
        const sourceFile = sourceFiles.pop()
        const ext = path.extname(sourceFile)
        let getDependenciesOverride = getDependencies
        if (ext in options) getDependenciesOverride = options[ext]

        return getDependenciesOverride(sourceFile, sourceText).then(deps => {
          deps = deps.filter(dep => !allDeps.includes(dep))
          if (deps.length === 0) return next(allDeps)
          allDeps = allDeps.concat(deps)

          return Promise.all(
            deps.map(
              dep => new Promise((resolve, reject) => {
                fs.readFile(dep, 'utf8', (error, text) => {
                  error ? reject(error) : resolve([ dep, text ])
                })
              })
            )
          ).then(sources => {
            sources.forEach(([ sourceFile, sourceText ]) => {
              sourceFiles.push(sourceFile, sourceText)
            })

            return next(allDeps)
          })
        })
      } else {
        return Promise.resolve(allDeps)
      }
    }

    return next()
  }
}
