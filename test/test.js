process.env.REACTX_LOADER_TEST = true

var path = require('path')
var webpack = require('webpack')
var MemoryFS = require('memory-fs')
var expect = require('chai').expect
var jsdom = require('jsdom')

var loaderPath = 'expose?reactxModule!' + path.resolve(__dirname, '../')
var mfs = new MemoryFS()
// webpack config
var globalConfig = {
  output: {
    path: '/',
    filename: 'test.build.js'
  },
  module: {
    loaders: [
      {
        test: /\.reactx$/,
        loader: loaderPath
      }
    ]
  }
}

function bundle (options, cb) {
  var config = Object.assign({}, globalConfig, options)
  var webpackCompiler = webpack(config)
  webpackCompiler.outputFileSystem = mfs
  webpackCompiler.run(function (err, stats) {
    expect(err).to.be.null
    if (stats.compilation.errors.length) {
      stats.compilation.errors.forEach(function (err) {
        console.error(err.message)
      })
    }
    expect(stats.compilation.errors).to.be.empty
    cb(mfs.readFileSync('/test.build.js').toString())
  })
}

function test (options, assert) {
  bundle(options, function (code) {
    jsdom.env({
      html: '<!DOCTYPE html><html><head></head><body></body></html>',
      src: [code],
      done: function (err, window) {
        if (err) {
          console.log(err[0].data.error.stack)
          expect(err).to.be.null
        }
        assert(window, interopDefault(window.reactxModule), window.reactxModule)
      }
    })
  })
}

// utils
function interopDefault (module) {
  return module
    ? module.__esModule ? module.default : module
    : module
}


describe('reactx-loader', function () {
  it('test', function (done) {
    done();
  })
});