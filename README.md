# reactx-loader

[![travis ci](https://travis-ci.org/sekaiamber/reactx-loader.svg)](https://travis-ci.org/sekaiamber/reactx-loader) [![npm package](https://img.shields.io/npm/v/reactx-loader.svg?maxAge=2592000)](https://www.npmjs.com/package/reactx-loader)


This is a webpack loader for transforming react single file component.

[中文文档](https://github.com/sekaiamber/reactx-loader/blob/master/README.zh-cn.md)

# Feature

It allows you to write your components in this format:

![reactx component](https://raw.githubusercontent.com/sekaiamber/reactx-loader/master/doc/reactx-loader.jpg)

`reactx-loader` also provide following features:

* Supports component hot-reloading during development.
* Supports [webpack css loader's **Local Scope** feature and syntax](https://github.com/webpack/css-loader#local-scope).
* Allows using other Webpack loaders for each part of a React component, for example SASS for `<style>` and CoffeeScript for `<script>`(if you like).


# How to use

1.install from npm

```bash
$ npm install reactx-loader --save-dev
```
2.config your webpack

```javascript
// webpack.config.js
var config = {
  loaders: [
    {
      test: /\.reactx$/,
      exclude: /node_modules/,
      loader: 'reactx'
    }
  ]
}
```

3.do whatever you want

```html
// component.reactx
<script>
  const React = require('react')

  export default class Index extends React.Component {
    render() {
      return (
        <div id="workspace">hi</div>
      )
    }
  }
</script>

<style>
  #workspace {
    color: red;
  }
</style>
```

```javascript
// other jsx file
import Index from './component.reactx'
...
```

## Use other languages that compile to JS 

Here we use Coffee as an example, you can modify the config of webpack(which we will mention in next part) to tell reactx-loader which loader it can use to process each languages. Because Coffee don't support JSX's HTML tag, so we use Coffee's embedded feature. But here we meet a problem, when using embedded Js of Coffee to export JSX's HTML tag, you should using `babel-loader` to process export code after `coffee-loader`'s processing. So my advice: unless you use react pure js api in your program, you shall use `babel-loader` after `coffee-loader`.

```html
<script lang="coffee">
  React = require 'react'

  class Index extends React.Component
    render: ->
      `<div id="workspace">hi</div>`

  module.exports = Index;
</script>
```

And for my favorite Typescript, I have tried for a while, but I can't find a solution. Because Typescript need your files extensions in `.ts||.tsx||.js||.jsx||.d.ts`, so when it compile `reactx` file, some error will throw out. But I'll still try to search for other solutions :)


## Use Pre-Processors of CSS

The same way of previous part.

```html
<style lang="sass">
  #workspace {
    color: red;
  }
</style>
```

You can modify the `sass` loader of reactx config like next part. You can add PostCSS loader(autoprefixer etc.) in config, or you can use PostCSS feature.


## Scoped CSS

`reactx-loader` support scoped CSS, we use [webpack css loader's **Local scope** feature and syntax](https://github.com/webpack/css-loader#local-scope), you can get each `<style>` tag's export via `reactx` object(or alias you set in the config):

```html
<script>
  const React = require('react')

  export default class Index extends React.Component {
    render() {
      return (
        <div id="workspace" className={reactx.style.scopedClassName}>hi</div>
      )
    }
  }
</script>

<style>
  #workspace:local(.scopedClassName){
    color: red;
  }
</style>
```

is transformed to

```html
<div id="workspace" class="_3WESzpK5lIiEqK-okbQCNB">hi</div>
```

```css
#workspace._3WESzpK5lIiEqK-okbQCNB{
  color: red;
}
```

If there are more than one `<style>` in your component, you can use `reactx.styles[n]` to get each tag's export.

## PostCSS

`reactx-loader` support [PostCSS](https://github.com/postcss/postcss), you can just add `postcss` option to the `reactx` webpack config(show in next part).

The `postcss` option accepts:

* An array of plugins;
* A function that returns an array of plugins;
* An object that contains options to be passed to the PostCSS processor. This is useful when you are using PostCSS projects that relies on custom parser/stringifiers:

```javascript
postcss: {
  plugins: [...], // list of plugins
  options: {
    parser: sugarss // use sugarss parser
  }
}
```

# Configuration

You can add `reactx` in your webpack config:

```javascript
var config = {
  reactx: {
    // loaders for each languages
    loaders: {
      js: 'babel',
      coffee: 'babel!coffee-loader',
      sass: 'style-loader!css-loader!autoprefixer?{browsers:["last 2 version", "> 1%"]}!sass'
    },
    // alias of `reactx` object
    alias: 'myreactx',
    // PostCSS options
    postcss: {
      plugins: [require('autoprefixer')({ browsers: ["last 2 version", "> 1%"] })], // list of plugins
      options: {
        parser: require('sugarss') // use sugarss parser
      }
    }
  }
}
```

# Test

```
$ npm run test
```

# Highlight and Linting

You can use `html` highlight for `reactx` or just use `vue component` :)

# Q&A
**Q:** What's the benefit of this format？  
**A:** A JS component must need 3 parts: `JS-CSS-HTML`, and `JSX` combines `JS-HTML` effectively, but when we need to combine styles to the `JSX` component, usually in 2 ways:

1. require style file
2. inline css

The first solution will make project file structure more complex. And the secend one will make the component unable to change style, you may need a lot of `!important` in your stylesheets.

So single file solution is a better way to manage your project files, and make it easy to extend.

**Q:** Why each component just have one `script` tag but can have many `style` tags?  
**A:** Because we can't determine the `export` of each `script` part easily.

# Next

1. ~~Support hot-reload of webpack-dev-server.~~
2. ~~Support scope style of component.~~
3. ~~Support PostCSS.~~
4. Support Typescript.
5. ~~Support sourceMap.~~
6. Support dependency injection.

# License

MIT