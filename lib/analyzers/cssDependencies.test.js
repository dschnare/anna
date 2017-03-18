const assert = require('assert')
const fs = require('fs')
const path = require('path')
const cssDependencies = require('./cssDependencies')
const Anna = require('..')

describe('cssDependencies', function () {
  it('should extract dependencies from .styl, .less and .css stylesheet files', function (done) {
    const analyze = cssDependencies()
    const anna = Anna.create()
    const sourceFile = 'fixtures/css/index.styl'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')
    analyze(sourceFile, sourceText, anna)
      .then(deps => {
        assert.deepStrictEqual(deps, [
          path.resolve('fixtures/css/base.less'),
          path.resolve('fixtures/css/anna.css'),
          path.resolve('fixtures/css/final.css'),
          'http://example.com/file.css',
          '//example.com/file.css'
        ])
        done()
      }).catch(done)
  })

  it('should reject when a dependency is not found', function (done) {
    const analyze = cssDependencies()
    const sourceFile = 'fixtures/css/notfound.css'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')
    analyze(sourceFile, sourceText).catch(() => done())
  })

  it('should resolve dependencies using the custom import paths', function (done) {
    const analyze = cssDependencies({ paths: [ 'fixtures/css/include' ] })
    const sourceFile = 'fixtures/css/pathing.css'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')
    analyze(sourceFile, sourceText)
      .then(deps => {
        assert.deepStrictEqual(deps, [
          path.resolve('fixtures/css/include/theme.css'),
          path.resolve('fixtures/css/include/base.css'),
          path.resolve('fixtures/css/include/index.css')
        ])
        done()
      }).catch(done)
  })
})

