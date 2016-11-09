var loaderUtils = require('loader-utils');

var hasBabel = false
try {
  hasBabel = !!require('babel-loader')
} catch (e) {}

var defaultLang = {
  styles: 'css',
  script: 'jsx'
}