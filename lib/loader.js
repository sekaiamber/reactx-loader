var loaderUtils = require('loader-utils')
var parse = require('./parser')
var path = require('path')
var objectAssign = require('object-assign')


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
  var options = this.options.__reactxOptions__ = objectAssign({}, this.options.reactx, this.reactx, query)
  var filePath = this.resourcePath
  var fileName = path.basename(filePath)

  var isProduction = this.minimize || process.env.NODE_ENV === 'production'

  // need source map
  var needSourceMap =
    !isProduction &&
    // this.sourceMap &&
    options.sourceMap !== false

  var defaultLoaders = {
    css: 'css-loader' + (needSourceMap ? '?sourceMap' : ''),
    js: hasBabel ? 'babel-loader' : '',
    jsx: hasBabel ? 'babel-loader' : ''
  }

  // check if there are custom loaders specified via
  // webpack config, otherwise use defaults
  var loaders = objectAssign({}, defaultLoaders, options.loaders)

  // get each part of origin code
  var parts = parse(content, fileName, needSourceMap)

  content = 'const React = require("react");export default class Index extends React.Component { render() { return ( <div id="workspace">hi</div> )}}'
  this.value = content;
	return content;
}