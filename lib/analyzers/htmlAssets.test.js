const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Anna = require('../.')
const htmlAssets = require('./htmlAssets')

describe.only('htmlAssets', function () {
  it('should resolve assets in <img src> attributes', function (done) {
    const analyze = htmlAssets()
    const anna = Anna.create()
    const sourceFile = 'fixtures/html/imgsrc.html'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')

    analyze(sourceFile, sourceText, anna).then(assets => {
      assert.deepStrictEqual(assets, [
        {
          assetUrl: '/assets/image.jpg',
          assetFile: path.resolve('fixtures/html/assets/image.jpg')
        },
        {
          assetUrl: 'image.png',
          assetFile: path.resolve('fixtures/html/image.png')
        }
      ])
      done()
    }).catch(done)
  })

  it('should resolve assets in <img srcset> attributes', function (done) {
    const analyze = htmlAssets()
    const anna = Anna.create()
    const sourceFile = 'fixtures/html/imgsrcset.html'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')

    analyze(sourceFile, sourceText, anna).then(assets => {
      assert.deepStrictEqual(assets, [
        {
          assetUrl: '/assets/image.jpg',
          assetFile: path.resolve('fixtures/html/assets/image.jpg')
        },
        {
          assetUrl: 'image.png',
          assetFile: path.resolve('fixtures/html/image.png')
        },
        {
          assetUrl: '/assets/hidpi.png',
          assetFile: path.resolve('fixtures/html/assets/hidpi.png')
        },
        {
          assetUrl: '/assets/alt.png',
          assetFile: path.resolve('fixtures/html/assets/alt.png')
        },
        {
          assetUrl: '/assets/a.png',
          assetFile: path.resolve('fixtures/html/assets/a.png')
        },
        {
          assetUrl: '/assets/b.png',
          assetFile: path.resolve('fixtures/html/assets/b.png')
        }
      ])
      done()
    }).catch(done)
  })

  it('should resolve assets in <script> attributes', function (done) {
    const analyze = htmlAssets()
    const anna = Anna.create()
    const sourceFile = 'fixtures/html/script.html'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')

    analyze(sourceFile, sourceText, anna).then(assets => {
      assert.deepStrictEqual(assets, [
        {
          assetUrl: 'imgsrc.html',
          assetFile: path.resolve('fixtures/html/imgsrc.html')
        },
        {
          assetUrl: 'image.png',
          assetFile: path.resolve('fixtures/html/image.png')
        },
        {
          assetUrl: 'assets/hidpi.png',
          assetFile: path.resolve('fixtures/html/assets/hidpi.png')
        }
      ])
      done()
    }).catch(done)
  })

  it('should resolve assets in <style> attributes', function (done) {
    const analyze = htmlAssets()
    const anna = Anna.create()
    const sourceFile = 'fixtures/html/style.html'
    const sourceText = fs.readFileSync(sourceFile, 'utf8')

    analyze(sourceFile, sourceText, anna).then(assets => {
      assert.deepStrictEqual(assets, [
        {
          assetUrl: 'image.png',
          assetFile: path.resolve('fixtures/html/image.png')
        },
        {
          assetUrl: '/assets/alt.png',
          assetFile: path.resolve('fixtures/html/assets/alt.png')
        }
      ])
      done()
    }).catch(done)
  })
})
