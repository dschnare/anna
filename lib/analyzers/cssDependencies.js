const fs = require('fs')
const path = require('path')

function getDependencies (sourceFile, sourceText, { paths = [] } = {}) {
  const deps = []
  const dir = path.dirname(sourceFile)
  const ext = path.extname(sourceFile)

  // Remove comments before analyzing.
  sourceText = sourceText
    .replace(/\/\/.+?\n/g, '') // Less and Sass
    .replace(/\/\*(?:\s|\S)+?\*\//g, '') // CSS

  // Imports
  // Example: @import "path";
  let pat = /@import\s+('|")(.+?)\1;/g
  let m = null
  while ((m = pat.exec(sourceText))) {
    deps.push(m[2])
  }

  // Imports with options (less)
  // Example: @import (option) "path";
  pat = /@import\s+\(([^)]+?)\)\s+('|")(.+?)\2;/g
  while ((m = pat.exec(sourceText))) {
    switch (m[1]) {
      // case 'reference':
      case 'inline':
      case 'less':
      case 'css':
      case 'once':
      case 'multiple':
      case 'optional':
        deps.push(m[3])
        break
    }
  }

  // Requires (stylus)
  // Example: @require 'file'
  pat = /@require\s+('|")(.+?)\1;/g
  while ((m = pat.exec(sourceText))) {
    deps.push(m[2])
  }

  const fileNamesList = deps.map(dep => {
    // URLs with a protocol get passed right through.
    if (dep.indexOf('//') >= 0) return dep

    return (
      path.extname(dep)
        ? [ path.join(dir, dep) ]
        : [
          path.join(dir, dep + ext),
          path.join(dir, dep, 'index' + ext)
        ]
    ).concat(
      paths.reduce((array, p) => {
        return array.concat(
          path.extname(dep)
            ? path.join(p, dep)
            : [
              path.join(p, dep + ext),
              path.join(p, dep, 'index' + ext)
            ]
        )
      }, [])
    ).map(fileName => path.resolve(fileName))
  })

  return Promise.all(
    fileNamesList.map((fileNames, d) => {
      if (Array.isArray(fileNames)) {
        let p = Promise.reject(new Error('Dependency not found: ' + deps[d]))
        while (fileNames.length) {
          const fileName = fileNames.shift()
          p = p.catch(() => new Promise((resolve, reject) => {
            fs.exists(fileName, exists => {
              exists
                ? resolve(fileName)
                : reject(new Error('Dependency not found: ' + deps[d] + ' in ' + fileName))
            })
          }))
        }
        return p
      } else {
        return Promise.resolve(fileNames)
      }
    })
  ).then(deps => deps.filter(Boolean))
}

module.exports = function cssDependencies ({ paths = [] } = {}) {
  return {
    kind: 'dependencies',
    analyze (sourceFile, sourceText, anna) {
      return getDependencies(sourceFile, sourceText, { paths })
    }
  }
}
