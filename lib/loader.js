var loaderUtils = require('loader-utils')
var parse = require('./parser')
var requireParser = require('./requireParser')
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
  // var isServer = this.options.target === 'node'
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
    css: 'style-loader!css-loader' + (needSourceMap ? '?sourceMap' : ''),
    js: hasBabel ? 'babel-loader' : '',
    jsx: hasBabel ? 'babel-loader' : ''
  }

  // check if there are custom loaders specified via
  // webpack config, otherwise use defaults
  var loaders = objectAssign({}, defaultLoaders, options.loaders)

  // get each part of origin code
  var parts = parse(content, fileName, needSourceMap)

  // build output code
  var output = 'var __reactx_exports__\n'

  // init require string parser
  var RequireParser = new requireParser({
    filePath: filePath,
    loaders: loaders,
    defaultLang: defaultLang,
    loaderContext: loaderContext,
    options: options
  })

  // add styles require
  if (parts.styles.length) {
    output += '\n/* styles */\n'
    parts.styles.forEach(function (style, i) {
      // check whether style is import from other file
      var requireString = style.src
        ? RequireParser.import('styles', style, style.scoped)
        : RequireParser.get('styles', style, i, style.scoped)

      output += requireString
    })
  }

  // add script require
  var script = parts.script;
  if (script) {
    output += '\n/* script */\n' +
      '__reactx_exports__ = ' + (
        script.src
          ? RequireParser.import('script', script)
          : RequireParser.get('script', script)
      )
  }

  // build exports code
  output += '\n/* exports */\n'
  var exports = ''
    // '__reactx_options__ = __reactx_exports__ = __reactx_exports__ || {}\n' +
    // // ES6 modules interop
    // 'if (\n' +
    // '  typeof __reactx_exports__.default === "object" ||\n' +
    // '  typeof __reactx_exports__.default === "function"\n' +
    // ') {\n' +
    //   (isProduction ? '' : checkNamedExports) +
    //   '__reactx_options__ = __reactx_exports__ = __reactx_exports__.default\n' +
    // '}\n' +
    // // constructor export interop
    // 'if (typeof __reactx_options__ === "function") {\n' +
    // '  __reactx_options__ = __reactx_options__.options\n' +
    // '}\n' +
    // // add filename in dev
    // (isProduction ? '' : ('__reactx_options__.__file = ' + JSON.stringify(filePath))) + '\n'

  if (!query.inject) {
    output += exports
    // TODO: hot reload
    
    // final export
    if (options.esModule) {
      output += '\nexports.__esModule = true;\nexports["default"] = __reactx_exports__\n'
    } else {
      output += '\nmodule.exports = __reactx_exports__\n'
    }
  } else {
    // inject-loader support
    output +=
      '\n/* dependency injection */\n' +
      'module.exports = function (injections) {\n' +
      '  __reactx_exports__ = __reactx_exports__(injections)\n' +
      exports +
      '  return __reactx_exports__\n' +
      '}'
  }

	return output;
}

