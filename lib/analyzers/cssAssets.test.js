const assert = require('assert')
const fs = require('fs')
const path = require('path')
const cssAssets = require('./cssAssets')
const Anna = require('../')

describe('cssAssets', function () {
  it('should resolve assets in url() styles', function (done) {
    const analyze = cssAssets()
    const anna = Anna.create()
    const sourceFile = 'fixtures/css/assets.css'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')
    analyze(sourceFile, sourceText, anna)
      .then(assets => {
        assert.deepStrictEqual(assets, [
          {
            assetUrl: '/base/index.styl',
            assetFile: path.resolve('fixtures/css/index.styl')
          },
          {
            assetUrl: '/dir/base.less',
            assetFile: path.resolve('fixtures/css/base.less')
          },
          {
            assetUrl: '/some/path/final.css',
            assetFile: path.resolve('fixtures/css/final.css')
          },
          {
            assetUrl: 'nofile.css',
            assetFile: null
          }
        ])
        done()
      }).catch(done)
  })
})
