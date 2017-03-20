const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Anna = require('../.')
const jsAssets = require('./jsAssets')

describe('jsAssets', function () {
  it('should resolve assets in string literals', function (done) {
    const analyze = jsAssets()
    const anna = Anna.create()
    const sourceFile = 'fixtures/js/pages/home/home.js'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')

    analyze(sourceFile, sourceText, anna).then(assets => {
      assert.deepStrictEqual(assets, [
        {
          assetUrl: '/assets/bg.png',
          assetFile: path.resolve('fixtures/js/assets/bg.png')
        },
        {
          assetUrl: '/home/image.png',
          assetFile: path.resolve('fixtures/js/pages/home/image.png')
        },
        {
          assetUrl: '/no-folder/music.mp3',
          assetFile: path.resolve('fixtures/js/music.mp3')
        }
      ])
      done()
    }).catch(done)
  })
})
