const assert = require('assert')
const path = require('path')
const fs = require('fs')
const resolveAsset = require('.')
const { enumerateAssetPaths } = require('.')

describe('resolveAsset', function () {
  it('should resolve to a null asset if given a falsey asset URl or cwd', function (done) {
    Promise.all([
      resolveAsset('', 'fixtures/css'),
      resolveAsset('/asset.txt', '')
    ]).then(assets => {
      assert.deepStrictEqual(assets[0], {
        assetUrl: '',
        assetFile: null
      })
      assert.deepStrictEqual(assets[1], {
        assetUrl: '/asset.txt',
        assetFile: null
      })
      done()
    }).catch(done)
  })

  it('should return remote URLs as-is without an asset file', function (done) {
    Promise.all([
      resolveAsset('http://example.com/file.css', 'fixtures/css'),
      resolveAsset('//example.com/file.css', '')
    ]).then(assets => {
      assert.deepStrictEqual(assets[0], {
        assetUrl: 'http://example.com/file.css',
        assetFile: null
      })
      assert.deepStrictEqual(assets[1], {
        assetUrl: '//example.com/file.css',
        assetFile: null
      })
      done()
    }).catch(done)
  })

  it('should resolve asset in same directory as source file', function (done) {
    resolveAsset('/base.less', 'fixtures/css').then(asset => {
      assert.deepStrictEqual(asset, {
        assetUrl: '/base.less',
        assetFile: path.resolve('fixtures/css/base.less')
      })
      done()
    }).catch(done)
  })

  it('should default to the current working directory if none is specified', function (done) {
    resolveAsset('/fixtures/css/base.less').then(asset => {
      assert.deepStrictEqual(asset, {
        assetUrl: '/fixtures/css/base.less',
        assetFile: path.resolve('fixtures/css/base.less')
      })
      done()
    }).catch(done)
  })

  it('should stop looking past the current working directory', function () {
    const assetFiles = enumerateAssetPaths('/fixtures/css/base.less')
    assert.deepStrictEqual(assetFiles, [
      'fixtures/css/base.less',
      'css/base.less',
      'base.less'
    ])
  })

  it('should find an asset in a parent directory', function (done) {
    resolveAsset('/css/base.less', 'fixtures/js').then(asset => {
      assert.deepStrictEqual(asset, {
        assetUrl: '/css/base.less',
        assetFile: path.resolve('fixtures/css/base.less')
      })
      done()
    }).catch(done)
  })

  it('should only find asset URLs that point to actual files', function (done) {
    resolveAsset('/css', 'fixtures/js').then(asset => {
      assert.deepStrictEqual(asset, {
        assetUrl: '/css',
        assetFile: null
      })
      done()
    }).catch(done)
  })
})
