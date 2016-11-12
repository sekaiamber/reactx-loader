process.env.REACTX_LOADER_TEST = true

var path = require('path')
var webpack = require('webpack')
var MemoryFS = require('memory-fs')
var expect = require('chai').expect
var jsdom = require('jsdom')
var ReactTestUtils = require('react-addons-test-utils')
var React = require('react')
var fs = require('fs')
var jsFiles = {
  jquery: fs.readFileSync(path.resolve(__dirname, '../node_modules/jquery/dist/jquery.min.js'), "utf-8"),
  react: fs.readFileSync(path.resolve(__dirname, '../node_modules/react/dist/react.min.js'), "utf-8"),
  reactDom: fs.readFileSync(path.resolve(__dirname, '../node_modules/react-dom/dist/react-dom.min.js'), "utf-8")
}

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
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel"
      },
    ]
  },
  externals: {
    react: "React",
    'react-dom': "ReactDOM",
    jquery: "$"
  },
  reactx: {
    // loaders for each langs
    loaders: {
      js: 'babel'
    },
    // whether use 
    sourceMap: true
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

function log(msg) {
  console.log('------------------------')
  console.log(msg)
  console.log('------------------------')
}

function test (options, assert) {
  bundle(options, function (code) {
    jsdom.env({
      html: '<!DOCTYPE html><html><head></head><body><div id="main"></div></body></html>',
      src: [jsFiles.jquery, jsFiles.react, jsFiles.reactDom, code],
      done: function (err, window) {
        // set global
        global.window = window;
        global.document = window.document;

        if (err) {
          console.log(err[0].data.error.stack)
          expect(err).to.be.null
        }
        assert(window, interopDefault(window.reactxModule), window.reactxModule)
      }
    })
  })
}

function testComponent (options, assert) {
  test(options, function (window, module, rawModule) {
    // render react component
    var render = window.ReactDOM.render;
    render(window.React.createElement(module, {}), document.getElementById("main"), function() {
      assert(window, module, window.reactxModule)
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
  it('basic', function (done) {
    testComponent({
      entry: './test/fixtures/basic.reactx'
    }, function (window, module, rawModule) {
      var $ = window.$;
      var document = window.document;
      var $node = $('#main', window.document);
      expect($node.length).to.equal(1);
      var $workspace = $('#workspace', $node);
      expect($workspace.length).to.equal(1);
      // it seems like jsdom does not implement inheritance
      // for getComputedStyle. So we have to check <style>
      // tag directly
      var $style = $('style', document);
      expect($style.length).to.equal(1);
      $style = $style.html();
      expect($style).to.contain('color: red');
      done()
    })
  })
});