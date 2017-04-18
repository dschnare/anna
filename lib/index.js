const Anna = require('./Anna')
const Analyzers = require('./analyzers')
const copyAssets = require('./copyAssets')

module.exports = Anna

Object.assign(Anna, {
  copyAssets,
  Analyzers
})
