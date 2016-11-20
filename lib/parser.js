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
    script: null,
    styles: []
  };

  // deal with script
  var _script = parts.find( part => part.type.toLowerCase() == 'script') || {}
  output.script = objectAssign({}, {
    content: '',
  }, _script.attribs);
  if (_script.children && _script.children.length > 0) {
  // get text children in the first script element
    var child = _script.children.find(function(child) {
      return child.type == 'text'
    });
    if (child.data) {
      // change other line to '\n', use for source map
      output.script.content = '\n'.repeat((content.slice(0, content.indexOf(child.data)).match(splitRE) || []).length) + child.data
    } else {
      output.script.content = '';
    }
  }

  // deal with styles
  output.styles = parts.filter(
    part => part.type.toLowerCase() == 'style'
  ).map(style => {
    var _style = {
      content: ''
    }
    _style = objectAssign({}, _style, style.attribs)
    if (style.children && style.children.length > 0) {
      // get text children in the style element
      var child = style.children.find(function(child) {
        return child.type == 'text'
      });
      if (child.data) {
      // change other line to '\n', use for source map
        _style.content = '\n'.repeat((content.slice(0, content.indexOf(child.data)).match(splitRE) || []).length) + child.data
      } else {
        _style.content = '';
      }
    }
    return _style
  })

  // deal with source map
  if (needMap) {
    if (output.script && !output.script.src) {
      output.script.map = generateSourceMap(
        filenameWithHash,
        content,
        output.script.content
      )
    }
    output.styles.forEach(child => {
      if (!child.src) {
        child.map = generateSourceMap(
          filenameWithHash,
          content,
          child.content
        )
      }
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
