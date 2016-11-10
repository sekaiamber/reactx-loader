var loaderUtils = require('loader-utils')
var path = require('path')


var hasBabel = false
try {
  hasBabel = !!require('babel-loader')
} catch (e) {}

var defaultLang = {
  styles: 'css',
  script: 'jsx'
}

module.exports = function (content) {
  this.cacheable()
  var isServer = this.options.target === 'node'
  var loaderContext = this
  var query = loaderUtils.parseQuery(this.query)
  var options = this.options.__reactxOptions__ = Object.assign({}, this.options.reactx, this.reactx, query)
  var filePath = this.resourcePath
  var fileName = path.basename(filePath)

  var isProduction = this.minimize || process.env.NODE_ENV === 'production'

  // 在非生产环境下，并且各种配置都允许sourceMap的情况下启用sourceMap
  var needCssSourceMap =
    !isProduction &&
    this.sourceMap &&
    options.cssSourceMap !== false

  var defaultLoaders = {
    css: 'css-loader' + (needCssSourceMap ? '?sourceMap' : ''),
    js: hasBabel ? 'babel-loader' : ''
  }

  // 检查其他loader，css和js如果没有loader就用defaultLoaders
  var loaders = Object.assign({}, defaultLoaders, options.loaders)

  console.log(this.options.module.loaders);

  this.value = content;
	return content;
}