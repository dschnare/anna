const fs = require('fs')
const path = require('path')
const ScannerDarkly = require('../scanner-darkly')
const AnalyzerDarkly = require('../analyzer-darkly')

const {
  String: StringTokenReader,
  Comment: CommentTokenReader,
  BlockComment: BlockCommentTokenReader,
  Word: WordTokenReader
} = ScannerDarkly.TokenReaders

function getDependencies (sourceFile, sourceText, { paths = [] } = {}) {
  const dir = path.dirname(sourceFile)
  const ext = path.extname(sourceFile)
  const scanner = ScannerDarkly.create([
    StringTokenReader.create(),
    BlockCommentTokenReader.create({ delimiters: [ '/*', '*/' ] }),
    CommentTokenReader.create({ delimiter: '//' }),
    WordTokenReader.create('();'.split(''), 'operator'),
    WordTokenReader.create('@import,@require'.split(','), 'keyword')
  ])
  const tokens = scanner.tokenize(sourceText)
  const uncommented = AnalyzerDarkly.getUncommentedTokens(tokens)

  // @import "path";
  const cssImports = AnalyzerDarkly.matchExpression(uncommented, [
    { value: '@import' },
    { type: 'string' },
    { value: ';' }
  ])

  // @import (option) "path";
  const lessImports = AnalyzerDarkly.matchExpression(uncommented, [
    { value: '@import' },
    { value: '(' },
    // We don't care about the option being used.
    { value: ')' },
    { type: 'string' },
    { value: ';' }
  ])

  // @require 'path'
  const stylusRequires = AnalyzerDarkly.matchExpression(uncommented, [
    { value: '@require' },
    { type: 'string' }
  ])

  const deps = [].concat(
    cssImports.map(m => m[1].value),
    lessImports.map(m => m[m.length - 2].value),
    stylusRequires.map(m => m[1].value)
  )

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
