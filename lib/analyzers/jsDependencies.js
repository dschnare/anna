const path = require('path')
const ScannerDarkly = require('../scanner-darkly')
const AnalyzerDarkly = require('../analyzer-darkly')

const {
  String: StringTokenReader,
  Comment: CommentTokenReader,
  BlockComment: BlockCommentTokenReader,
  Word: WordTokenReader
} = ScannerDarkly.TokenReaders

function getDependencies (sourceFile, sourceText) {
  const dir = path.dirname(sourceFile)

  let scanner = ScannerDarkly.create([
    StringTokenReader.create({ multilineQuote: '`' }),
    BlockCommentTokenReader.create({ delimiters: [ '/*', '*/' ] }),
    CommentTokenReader.create({ delimiter: '//' }),
    WordTokenReader.create('()'.split(''), 'operator'),
    WordTokenReader.create('import,from,require'.split(','), 'keyword')
  ])

  // Coffee script has different syntax for comments and multiline strings.
  if (path.extname(sourceFile) === '.coffee') {
    scanner = ScannerDarkly.create([
      StringTokenReader.create({ multilineQuote: '"""' }),
      BlockCommentTokenReader.create({ delimiters: [ '###', '###' ] }),
      CommentTokenReader.create({ delimiter: '##' }),
      WordTokenReader.create('()'.split(''), 'operator'),
      WordTokenReader.create('import,from,require'.split(','), 'keyword')
    ])
  }

  const tokens = scanner.tokenize(sourceText)
  const uncommented = AnalyzerDarkly.getUncommentedTokens(tokens)

  const esModuleImports = AnalyzerDarkly.matchExpression(uncommented, [
    { value: 'import' },
    { value: 'from' },
    { type: 'string' }
  ]).concat(AnalyzerDarkly.matchExpression(uncommented, [
    { value: 'import' },
    { type: 'string' }
  ]))

  const requireCalls = AnalyzerDarkly.matchExpression(uncommented, [
    { value: 'require' },
    { value: '(' },
    { type: 'string' },
    { value: ')' }
  ])

  let deps = [].concat(
    esModuleImports.map(m => m[m.length - 1].value),
    requireCalls.map(m => m[m.length - 2].value)
  )

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
