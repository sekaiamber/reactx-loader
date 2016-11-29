var loaderUtils = require('loader-utils')
var objectAssign = require('object-assign')

module.exports = function (content) {
  this.cacheable()
  var loaderOpt = this.options.__reactxOptions__
  // decode query
  var query = loaderUtils.parseQuery(this.query)
  query = objectAssign({
    styles: []
  }, query)
  query.styles = query.styles.map((s) => s.replace(/\$_\$/g, '!'))

  // style require
  var output = '\n/* reactx object */\n\n/* reactx styles */\n';
  for (var i = 0; i < query.styles.length; i++) {
    output += 'var __reactx_styles_' + i + '__ = ' + query.styles[i] + '\n';
  }
  // reactx object
  var reactxObj = 'var ' + (loaderOpt.alias || 'reactx') + ' = { styles: [] }\n'
  for (var i = 0; i < query.styles.length; i++) {
    reactxObj += 'reactx.styles[' + i + '] = __reactx_styles_' + i + '__\n';
  }
  reactxObj += 'reactx.style = reactx.styles[0]\n'
  if (loaderOpt.alias) {
    reactxObj = reactxObj.replace(/reactx\./g, loaderOpt.alias + '.')
  }
  
  output += reactxObj;
  output += '\n/* reactx object end */\n'
  output += content

  return output;
}