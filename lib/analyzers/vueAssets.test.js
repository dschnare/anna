const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Anna = require('../.')
const vueAssets = require('./vueAssets')

describe('vueAssets', function () {
  it('should resolve assets in <template>, <script> and <style> blocks', function (done) {
    const analyzer = vueAssets()
    const anna = Anna.create()
    const sourceFile = 'fixtures/vue/Component-assets.vue'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')

    analyzer.analyze(sourceFile, sourceText, anna).then(assets => {
      assert.deepEqual(assets, [
        // <template>
        {
          assetUrl: '/assets/a.png',
          assetFile: path.resolve('fixtures/vue/assets/a.png')
        },
        {
          assetUrl: '/assets/b.png',
          assetFile: path.resolve('fixtures/vue/assets/b.png')
        },
        {
          assetUrl: '/assets/c.png',
          assetFile: path.resolve('fixtures/vue/assets/c.png')
        },
        // <script>
        {
          assetUrl: '/assets/e.png',
          assetFile: path.resolve('fixtures/vue/assets/e.png')
        },
        {
          assetUrl: '/assets/styles.css',
          assetFile: path.resolve('fixtures/vue/assets/styles.css')
        },
        // <style>
        {
          assetUrl: '/assets/d.png',
          assetFile: path.resolve('fixtures/vue/assets/d.png')
        }
      ])
      done()
    }).catch(done)
  })
})
