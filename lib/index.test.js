const assert = require('assert')
const path = require('path')
const Anna = require('.')

describe('Anna#analyze', function () {
  it('should return an empty object when analyzing no source files', function (done) {
    Anna.create()
      .use('deps', /\.(css|styl|less)$/, Anna.cssDependencies())
      .use('deps', /\.js$/, Anna.jsDependencies())
      .analyze([])
      .then(result => {
        assert.deepStrictEqual(result, {})
        done()
      }).catch(done)
  })

  it('should return an empty object when no analyzers can analyze source files', function (done) {
    Anna.create()
      .use('deps', /\.(css|styl|less)$/, Anna.cssDependencies())
      .analyze('fixtures/js/index.js')
      .then(result => {
        assert.deepStrictEqual(result, {})
        done()
      }).catch(done)
  })

  it('should throw when a source file that can be analyzed does not exist', function (done) {
    Anna.create()
      .use('deps', /\.(css|styl|less)$/, Anna.cssDependencies())
      .analyze('nofile.css')
      .catch(() => done())
  })

  it('should extract dependencies from several file types', function (done) {
    Anna.create()
      .use('deps', /\.(css|styl|less)$/, Anna.cssDependencies())
      .use('deps', /\.js$/, Anna.jsDependencies())
      .analyze([
        'fixtures/css/index.styl',
        'fixtures/js/index.js'
      ])
      .then(result => {
        assert.deepStrictEqual(result, {
          deps: [
            path.resolve('fixtures/css/base.less'),
            path.resolve('fixtures/css/anna.css'),
            path.resolve('fixtures/css/final.css'),
            'http://example.com/file.css',
            '//example.com/file.css',
            path.resolve('fixtures/js/base.js'),
            path.resolve('fixtures/js/anna.js'),
            require.resolve('assert')
          ]
        })
        done()
      })
      .catch(done)
  })

  it('should extract dependencies from several file types (using append array merge strategy)', function (done) {
    Anna.create()
      .use('deps[+]', /\.(css|styl|less)$/, Anna.cssDependencies())
      .use('deps[+]', /\.js$/, Anna.jsDependencies())
      .analyze([
        'fixtures/css/index.styl',
        'fixtures/js/index.js'
      ])
      .then(result => {
        assert.deepStrictEqual(result, {
          deps: [
            [
              path.resolve('fixtures/css/base.less'),
              path.resolve('fixtures/css/anna.css'),
              path.resolve('fixtures/css/final.css'),
              'http://example.com/file.css',
              '//example.com/file.css'
            ],
            [
              path.resolve('fixtures/js/base.js'),
              path.resolve('fixtures/js/anna.js'),
              require.resolve('assert')
            ]
          ]
        })
        done()
      })
      .catch(done)
  })

  it('should extract dependencies from several file types (using concat array merge strategy)', function (done) {
    Anna.create()
      .use('deps[++]', /\.(css|styl|less)$/, Anna.cssDependencies())
      .use('deps[++]', /\.js$/, Anna.jsDependencies())
      .analyze([
        'fixtures/css/index.styl',
        'fixtures/js/index.js'
      ])
      .then(result => {
        assert.deepStrictEqual(result, {
          deps: [
            path.resolve('fixtures/css/base.less'),
            path.resolve('fixtures/css/anna.css'),
            path.resolve('fixtures/css/final.css'),
            'http://example.com/file.css',
            '//example.com/file.css',
            path.resolve('fixtures/js/base.js'),
            path.resolve('fixtures/js/anna.js'),
            require.resolve('assert')
          ]
        })
        done()
      })
      .catch(done)
  })

  it('should extract dependencies from several file types (using replace array merge strategy)', function (done) {
    Anna.create()
      .use('deps[=]', /\.(css|styl|less)$/, Anna.cssDependencies())
      .use('deps=', /\.js$/, Anna.jsDependencies())
      .analyze([
        'fixtures/css/index.styl',
        'fixtures/js/index.js'
      ])
      .then(result => {
        assert.deepStrictEqual(result, {
          deps: [
            path.resolve('fixtures/js/base.js'),
            path.resolve('fixtures/js/anna.js'),
            require.resolve('assert')
          ]
        })
        done()
      })
      .catch(done)
  })
})
