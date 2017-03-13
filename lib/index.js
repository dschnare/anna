const fs = require('fs')
const path = require('path')
const { Anna } = require('./Anna')
const analyzers = require('./analyzers')
const resolveAsset = require('./resolveAsset')
const copyAssets = require('./copyAssets')
const makeRecursiveDependencyAnalyzer = require('./makeRecursiveDependencyAnalyzer')

exports.create = () => Anna.create()
exports.resolveAsset = resolveAsset
exports.copyAssets = copyAssets
exports.makeRecursiveDependencyAnalyzer = makeRecursiveDependencyAnalyzer
exports.jsAssets = analyzers.jsAssets
exports.jsDependencies = analyzers.jsDependencies
exports.cssAssets = analyzers.cssAssets
exports.cssDependencies = analyzers.cssDependencies
exports.htmlAssets = analyzers.htmlAssets
exports.vueAssets = analyzers.vueAssets
exports.vueDependencies = analyzers.vueDependencies
