var loaderUtils = require('loader-utils')
var normalize = require('./normalize')

// internal lib loaders
var styleRewriterPath = normalize.lib('style-rewriter')
var selectorPath = normalize.lib('selector')

function getRequireString (type, part, index) {
  return loaderUtils.stringifyRequest(this.loaderContext,
    // disable all configuration loaders
    '!!' +
    // get loader string for pre-processors
    this.getLoaderString(type, part) +
    // select the corresponding part from the vue file
    this.getSelectorString(type, index || 0) +
    // the url to the actual vuefile
    this.filePath
  )
}

function getRequireForImportString (type, impt) {
  return loaderUtils.stringifyRequest(this.loaderContext,
    '!!' +
    this.getLoaderString(type, impt) +
    impt.src
  )
}

var rewriterInjectRE = /\b(css(?:-loader)?(?:\?[^!]+)?)(?:!|$)/
function getLoaderString (type, part) {
  var lang = part.lang || this.defaultLang[type]
  var loader = this.loaders[lang]
  var rewriter = type === 'styles' ? styleRewriterPath + '!': ''
  if (loader !== undefined) {
    // inject rewriter before css/html loader for
    // extractTextPlugin use cases
    if (rewriterInjectRE.test(loader)) {
      loader = loader.replace(rewriterInjectRE, function (m, $1) {
        return ensureBang($1) + rewriter
      })
    } else {
      loader = ensureBang(loader) + rewriter
    }
    return ensureBang(loader)
  } else {
    // unknown lang, infer the loader to be used
    switch (type) {
      case 'styles':
        // use most common style loader string
        loader = 'style-loader!css-loader'
        return loader + '!' + rewriter + lang + '!'
      case 'script':
        // we believe developer can hold language loader self
        return lang + '!'
    }
  }
}

function getSelectorString (type, index) {
  return selectorPath +
    '?type=' + type +
    '&index=' + index + '!'
}

function ensureBang (loader) {
  if (loader.charAt(loader.length - 1) !== '!') {
    return loader + '!'
  } else {
    return loader
  }
}


// parser

function requireParser(opt) {
  for (var key in opt) {
    if (opt.hasOwnProperty(key)) {
      this[key] = opt[key];
    }
  }
}

requireParser.prototype = {
  get: function(type, part, index) {
    return 'require(' +
      this.getRequireString(type, part, index) +
    ')\n'
  },
  import: function(type, impt) {
    return 'require(' +
      this.getRequireForImportString(type, impt) +
    ')\n'
  },
  getRequireString: getRequireString,
  getRequireForImportString: getRequireForImportString,
  getLoaderString: getLoaderString,
  getSelectorString: getSelectorString
}

module.exports = requireParser