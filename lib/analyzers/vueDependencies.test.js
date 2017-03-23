const assert = require('assert')
const path = require('path')
const Anna = require('../.')

describe('vueDependencies', function () {
  it('should resolve ES6 and CommonJS dependencies in <script> blocks and CSS imports in <style> blocks', function (done) {
    const anna = Anna
      .create()
      .use('deps', /\.vue$/, Anna.vueDependencies())
      .use('deps', /\.js$/, Anna.jsDependencies())
      .use('deps', /\.css$/, Anna.cssDependencies())

    const sourceFile = 'fixtures/vue/Component-dependencies.vue'

    anna.analyze(sourceFile).then(({ deps }) => {
      assert.deepStrictEqual(deps, [
        path.resolve('fixtures/vue/assets/Component.js'),
        path.resolve('fixtures/vue/assets/styles.css'),
        path.resolve('fixtures/vue/assets/tool/index.js'),
        path.resolve('fixtures/vue/assets/tool/something.js'),
        path.resolve('fixtures/vue/assets/base.css')
      ])
      done()
    }).catch(done)
  })
})
