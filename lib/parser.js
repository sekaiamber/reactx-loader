var cache = require('lru-cache')(100)
var hash = require('hash-sum')
var htmlparser = require("htmlparser2")
var objectAssign = require('object-assign')
var SourceMapGenerator = require('source-map').SourceMapGenerator

var allowPartsType = ['script', 'style']
var splitRE = /\r?\n/g
var emptyRE = /^(?:\/\/)?\s*$/

module.exports = function (content, filename, needMap) {
  var cacheKey = hash(filename + content)
  // source-map cache busting for hot-reloadded modules
  var filenameWithHash = filename + '?' + cacheKey
  var output = cache.get(cacheKey)
  if (output) return output

  // get each parts as html code
  var parts = htmlparser.parseDOM(content);
  parts = parts.filter(
    part => allowPartsType.indexOf(part.type.toLowerCase()) > -1
  )

  // define output obj
  output = {
    scripts: [],
    styles: []
  };

  // deal with script
  output.scripts = parts.filter(
    part => part.type.toLowerCase() == 'script'
  ).map(script => {
    var _script = {
      content: '',
    }
    _script = objectAssign({}, _script, script.attribs)
    if (script.children && script.children.length > 0) {
      // get text children in the script element, and combine them
      var children = script.children.filter(function(child) {
        return child.type == 'text'
      }).map(function(child) {
        return child.data
      })
      _script.content = children.join('\n\n')
    }
    return _script
  })

  // deal with styles
  output.styles = parts.filter(
    part => part.type.toLowerCase() == 'style'
  ).map(style => {
    var _style = {
      content: ''
    }
    _style = objectAssign({}, _style, style.attribs)
    if (style.children && style.children.length > 0) {
      // get text children in the style element, and combine them
      var children = style.children.filter(function(child) {
        return child.type == 'text'
      }).map(function(child) {
        return child.data
      })
      _style.content = children.join('\n\n')
    }
    return _style
  })

  // deal with source map
  if (needMap) {
    ['scripts', 'styles'].forEach(tag => {
      output[tag].forEach(child => {
        if (!child.src) {
          child.map = generateSourceMap(
            filenameWithHash,
            content,
            child.content
          )
        }
      })
    })
  }

  cache.set(cacheKey, output)
  return output
}

function generateSourceMap (filename, source, generated) {
  var map = new SourceMapGenerator()
  map.setSourceContent(filename, source)
  generated.split(splitRE).forEach((line, index) => {
    if (!emptyRE.test(line)) {
      map.addMapping({
        source: filename,
        original: {
          line: index + 1,
          column: 0
        },
        generated: {
          line: index + 1,
          column: 0
        }
      })
    }
  })
  return map.toJSON()
}
