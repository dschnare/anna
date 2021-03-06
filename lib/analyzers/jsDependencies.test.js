const assert = require('assert')
const path = require('path')
const Anna = require('../.')
const jsDependencies = require('./jsDependencies')

describe('jsDependencies', function () {
  it('should resolve ES6 and CommonJS dependencies', function (done) {
    const analyzer = jsDependencies()
    const anna = Anna
      .create()
      .use('deps', /\.js$/, analyzer)
    const sourceFile = 'fixtures/js/index.js'

    anna.analyze(sourceFile).then(({ deps }) => {
      assert.deepStrictEqual(deps, [
        path.resolve('fixtures/js/base.js'),
        path.resolve('fixtures/js/anna.js'),
        require.resolve('assert')
      ])
      done()
    }).catch(done)
  })
})
