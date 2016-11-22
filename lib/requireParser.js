var loaderUtils = require('loader-utils')
var normalize = require('./normalize')

// internal lib loaders
var styleRewriterPath = normalize.lib('style-rewriter')
var scriptRewriterPath = normalize.lib('script-rewriter')
var selectorPath = normalize.lib('selector')

// script
function script_getRequireString (part, rewriterOpt) {
  return loaderUtils.stringifyRequest(this.loaderContext,
    // disable all configuration loaders
    '!!' +
    // get loader string for pre-processors
    this.getLoaderString(part, rewriterOpt) +
    // select the corresponding part from the reactx file
    this.getSelectorString('script', 0) +
    // the url to the actual reactx file
    this.filePath
  )
}

function script_getLoaderString (part, rewriterOpt) {
  var lang = part.lang || this.defaultLang['script'];
  var loader = this.loaders[lang];
  var rewriter = scriptRewriterPath + '?';
  // build rewriter optionts
  var ropts = []
  if (rewriterOpt.styles) {
    for (var i = 0; i < rewriterOpt.styles.length; i++) {
      ropts.push('styles[]=' + rewriterOpt.styles[i])
    }
  }
  rewriter += ropts.join(',')
  rewriter += '!';
  if (loader !== undefined) {
    loader = rewriter + ensureBang(loader);
    return ensureBang(loader)
  } else {
    // we believe developer can hold language loader self
    return lang + '!'
  }
}

// style
function style_getRequireString (part, index) {
  return loaderUtils.stringifyRequest(this.loaderContext,
    // disable all configuration loaders
    '!!' +
    // get loader string for pre-processors
    this.getLoaderString(part) +
    // select the corresponding part from the reactx file
    this.getSelectorString('styles', index || 0) +
    // the url to the actual reactx file
    this.filePath
  )
}

var styleRewriterInjectRE = /\b(css(?:-loader)?(?:\?[^!]+)?)(?:!|$)/
function style_getLoaderString (part) {
  var lang = part.lang || this.defaultLang['styles'];
  var loader = this.loaders[lang];
  var rewriter = styleRewriterPath + '!';
  if (loader !== undefined) {
    // inject rewriter before css/html loader for
    // extractTextPlugin use cases
    if (styleRewriterInjectRE.test(loader)) {
      loader = loader.replace(styleRewriterInjectRE, function (m, $1) {
        return ensureBang($1) + rewriter
      })
    } else {
      loader = ensureBang(loader) + rewriter
    }
    return ensureBang(loader)
  } else {
    // use most common style loader string
    loader = 'style-loader!css-loader'
    return loader + '!' + rewriter + lang + '!'
  }
}

function getRequireForImportString (impt, rewriterOpt) {
  return loaderUtils.stringifyRequest(this.loaderContext,
    '!!' +
    this.getLoaderString(impt, rewriterOpt) +
    impt.src
  )
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
      this.script[key] = opt[key];
      this.style[key] = opt[key];
    }
  }
}

requireParser.prototype = {
  script: {
    get: function(part, rewriterOpt) {
      return 'require(' +
        this.getRequireString(part, rewriterOpt) +
      ')\n'
    },
    import: function(impt, rewriterOpt) {
      return 'require(' +
        this.getRequireForImportString(impt, rewriterOpt) +
      ')\n'
    },
    getRequireString: script_getRequireString,
    getRequireForImportString: getRequireForImportString,
    getLoaderString: script_getLoaderString,
    getSelectorString: getSelectorString
  },
  style: {
    get: function(part, index) {
      return 'require(' +
        this.getRequireString(part, index) +
      ')\n'
    },
    import: function(impt) {
      return 'require(' +
        this.getRequireForImportString(impt) +
      ')\n'
    },
    getRequireString: style_getRequireString,
    getRequireForImportString: getRequireForImportString,
    getLoaderString: style_getLoaderString,
    getSelectorString: getSelectorString
  }
}

module.exports = requireParser