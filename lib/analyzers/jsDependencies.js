const path = require('path')

function getDependencies (sourceFile, sourceText) {
  let deps = []
  const dir = path.dirname(sourceFile)

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

  // ES6 imports
  let pat = /import(?:.+from |\s+)('|")(.+?)\1/g
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
              throw new Error('Dependency not found: ' + dep + ' in ' + sourceFile)
            }
          } else {
            throw new Error('Dependency not found: ' + dep + ' in ' + sourceFile)
          }
        }
      })
      resolve(deps)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = function jsDependencies () {
  return {
    kind: 'dependencies',
    analyze: getDependencies
  }
}
