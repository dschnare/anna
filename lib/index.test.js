const assert = require('assert')
const path = require('path')
const Anna = require('.')

describe('Anna#analyze', function () {
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
})
