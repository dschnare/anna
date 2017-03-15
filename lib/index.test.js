const assert = require('assert')
const path = require('path')
const Anna = require('.')

describe('Anna#analyze', function () {
  it('should return an empty object when analyzing no source files', function (done) {
    Anna.create()
      .use('deps', /\.css$/, Anna.cssDependencies())
      .use('deps', /\.js$/, Anna.jsDependencies())
      .analyze([])
      .then(result => {
        assert.deepStrictEqual(result, {})
        done()
      }).catch(done)
  })

  it('should return an empty object when no analyzers can analyze source files', function (done) {
    Anna.create()
      .use('deps', /\.css$/, Anna.cssDependencies())
      .analyze('fixtures/index.js')
      .then(result => {
        assert.deepStrictEqual(result, {})
        done()
      }).catch(done)
  })

  it('should extract dependencies from several file types', function (done) {
    Anna.create()
      .use('deps', /\.css$/, Anna.cssDependencies())
      .use('deps', /\.js$/, Anna.jsDependencies())
      .analyze([
        'fixtures/index.css',
        'fixtures/index.js'
      ])
      .then(result => {
        assert.deepStrictEqual(result, {
          deps: [
            path.resolve('fixtures/base.css'),
            path.resolve('fixtures/anna.css'),
            path.resolve('fixtures/base.js'),
            path.resolve('fixtures/anna.js')
          ]
        })
        done()
      })
      .catch(done)
  })

  it('should extract dependencies from several file types (using append array merge strategy)', function (done) {
    Anna.create()
      .use('deps[+]', /\.css$/, Anna.cssDependencies())
      .use('deps[+]', /\.js$/, Anna.jsDependencies())
      .analyze([
        'fixtures/index.css',
        'fixtures/index.js'
      ])
      .then(result => {
        assert.deepStrictEqual(result, {
          deps: [
            [
              path.resolve('fixtures/base.css'),
              path.resolve('fixtures/anna.css')
            ],
            [
              path.resolve('fixtures/base.js'),
              path.resolve('fixtures/anna.js')
            ]
          ]
        })
        done()
      })
      .catch(done)
  })

  it('should extract dependencies from several file types (using concat array merge strategy)', function (done) {
    Anna.create()
      .use('deps[++]', /\.css$/, Anna.cssDependencies())
      .use('deps[++]', /\.js$/, Anna.jsDependencies())
      .analyze([
        'fixtures/index.css',
        'fixtures/index.js'
      ])
      .then(result => {
        assert.deepStrictEqual(result, {
          deps: [
            path.resolve('fixtures/base.css'),
            path.resolve('fixtures/anna.css'),
            path.resolve('fixtures/base.js'),
            path.resolve('fixtures/anna.js')
          ]
        })
        done()
      })
      .catch(done)
  })

  it('should extract dependencies from several file types (using replace array merge strategy)', function (done) {
    Anna.create()
      .use('deps[=]', /\.css$/, Anna.cssDependencies())
      .use('deps=', /\.js$/, Anna.jsDependencies())
      .analyze([
        'fixtures/index.css',
        'fixtures/index.js'
      ])
      .then(result => {
        assert.deepStrictEqual(result, {
          deps: [
            path.resolve('fixtures/base.js'),
            path.resolve('fixtures/anna.js')
          ]
        })
        done()
      })
      .catch(done)
  })
})
