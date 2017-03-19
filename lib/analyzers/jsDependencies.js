const path = require('path')
const makeRecursiveDependencyAnalyzer = require('../makeRecursiveDependencyAnalyzer')

function getDependencies (sourceFile, sourceText) {
  let deps = []
  const dir = path.dirname(sourceFile)

  // ES6 imports
  let pat = /import.+from ('|")(.+?)\1/g
  let m = null
  while ((m = pat.exec(sourceText))) {
    deps.push(m[2])
  }

  // CommonJS require calls
  pat = /require\(\s*('|")(.+?)\1\s*\)/g
  while ((m = pat.exec(sourceText))) {
    deps.push(m[2])
  }

  // We will need the following options to support AMD modules:
  // - baseUrl
  // - paths (hash of path mappings)
  // - external
  // ... etc.
  // // AMD define calls
  // pat = /define\(\s*\[(.+?)\]/g
  // sourceText.replace(pat, (s, list) => {
  //   deps.push.apply(deps, list.replace(/'|"/g, '').split(/,\s*/))
  // })

  return new Promise((resolve, reject) => {
    try {
      deps = deps.map(dep => {
        return dep.charAt(0) === '.' ? path.resolve(dir, dep) : dep
      }).map(dep => {
        try {
          return require.resolve(dep)
        } catch (error) {
          if (!path.extname(dep) && path.extname(sourceFile) !== '.js') {
            dep += path.extname(sourceFile)
            try {
              return require.resolve(dep)
            } catch (error) {
              throw new Error('Dependency not found:' + dep)
            }
          } else {
            throw new Error('Dependency not found:' + dep)
          }
        }
      })
      resolve(deps)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = function jsDependencies (options = {}) {
  return makeRecursiveDependencyAnalyzer(getDependencies, options || {})
}
