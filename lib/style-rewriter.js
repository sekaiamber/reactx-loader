module.exports = function (content) {
  this.cacheable()
  this.value = content;
  return content;
}