# reactx-loader

[![travis ci](https://travis-ci.org/sekaiamber/reactx-loader.svg)](https://travis-ci.org/sekaiamber/reactx-loader) [![npm package](https://img.shields.io/npm/v/reactx-loader.svg?maxAge=2592000)](https://www.npmjs.com/package/reactx-loader)


用来加载react单文件组件的webpack loader。

# 功能

这个webpack loader允许你将react组件写成如下的格式：

![reactx component](https://raw.githubusercontent.com/sekaiamber/reactx-loader/master/doc/reactx-loader.jpg)

`reactx-loader`也支持如下功能：

* 支持开发模式下的热加载
* 支持[webpack css loader的**Local Scope**功能和语法](https://github.com/webpack/css-loader#local-scope)。
* 支持使用其他Webpack loader来加载React组件的各个部分，比如使用SASS来加载`<style>`标签，或者使用CoffeeScript来编译`<script>`标签（如果你坚持这么做。。）

# 如何使用

1.使用npm安装依赖

```bash
$ npm install reactx-loader --save-dev
```
2.配置你的webpack

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

3.该干嘛干嘛

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

## 使用其他JavaScript预处理语言

这儿以Coffee为例，你可以在下面配置项中增加Coffee对应的loader来处理Coffee代码，因为coffee至今不支持jsx的html标签写法，所以就干脆用他的直接输出，但是这产生了问题，你必须在`coffee-loader`处理代码之后再让`babel`处理一次，所以我的建议是除非你用React的PureJS API来编程，不然在`coffee-loader`处理之后必须再处理一次将ES6代码编译为ES5。

```html
<script lang="coffee">
  React = require 'react'

  class Index extends React.Component
    render: ->
      `<div id="workspace">hi</div>`

  module.exports = Index;
</script>
```

关于我特别喜欢的Typescript，我研究了一会儿，暂时找不到解决方案，原因是什么呢，Typescript要求你的代码源文件扩展名必须为`.ts||.tsx||.js||.jsx||.d.ts`，所以造成了Typescript编译`.reactx`文件时会报错说找不到文件。我接下来会尝试看看有没有其他曲线救国的方案。

## 使用其他CSS预处理语言

方式同上。

```html
<style lang="sass">
  #workspace {
    color: red;
  }
</style>
```

你可以像下面配置项中配置的`sass`的loader一样，将需要的PostCSS手动写入loader中，或者使用PostCSS功能。

## Scoped CSS

`reactx-loader`支持Scoped CSS，我们使用[webpack css loader的Local scope功能和语法](https://github.com/webpack/css-loader#local-scope)，你可以在`<script>`标签中访问`reactx`对象（或者配置项中的alias）来获得相应的`<style>`标签的引用。

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

上述代码将被转义为：

```html
<div id="workspace" class="_3WESzpK5lIiEqK-okbQCNB">hi</div>
```

```css
#workspace._3WESzpK5lIiEqK-okbQCNB{
  color: red;
}
```

若一个组件中包含多个`<style>`标签，那么你可以使用`reactx.styles[n]`来访问每个标签的引用。

## PostCSS

`reactx-loader`支持[PostCSS](https://github.com/postcss/postcss)，你可以在Webpack的`reactx`配置中增加`postcss`项（下一部分有示例）。

`postcss`配置项接受下列输入：

* 一个plugin数组
* 一个返回plugin数组的函数
* 一个包含各个PostCSS配置项的对象，这个对象将传递给`reactx`的PostCSS处理器。这个方式经常用在要使用PostCSS预处理parser的情况下（比如SugarSS之类的）

```javascript
postcss: {
  plugins: [...], // list of plugins
  options: {
    parser: sugarss // use sugarss parser
  }
}
```

# 配置项

在webpack的配置中可以添加`reactx`的项：

```javascript
var config = {
  reactx: {
    // 为指定语言指定loader
    loaders: {
      js: 'babel',
      coffee: 'babel!coffee-loader',
      sass: 'style-loader!css-loader!autoprefixer?{browsers:["last 2 version", "> 1%"]}!sass'
    },
    // `reactx`对象的别名
    alias: 'myreactx',
    // PostCSS配置项
    postcss: {
      plugins: [require('autoprefixer')({ browsers: ["last 2 version", "> 1%"] })], // plugin数组
      options: {
        parser: require('sugarss') // 使用SugarSS
      }
    }
  }
}
```

# 测试

```
$ npm run test
```

# 高亮及提示

若你的编辑器没有使用任何配置，可以直接使用`html`为`reactx`文件高亮。因为当前这个库的语法接近VUE单文件组件，所以你可以使用`vue component(*.vue)`来高亮。

# Q&A
**Q:** 这种写法有什么好处？  
**A:** React提倡组件化的思想，为大型前端项目构建提供了可能。而一个前端组件势必包含`JS-CSS-HTML`这3元素，`JSX`很好地解决了`JS-HTML`的结合，然而实际编程中，样式也是必要的一部分，当前2种解决方案：

1. require样式文件
2. inline css

前者使得项目文件越来越多，眼花缭乱，通过命名约定也许缓解一部分这些痛苦，但还是有点难受。而后者更有种饮鸩止渴的感觉，我个人不太喜欢inline样式，不然外部样式将大量充斥`!important`，毕竟组件还是需要扩展的，太封闭也不好。

Vue的单文件组件格式很好地结合了`JS-CSS-HTML`，所以就移到了react上。

**Q:** 为何每个组件只有一个`script`而可以有多个`style`?  
**A:** 因为我们无法有效判断多个`script`各自的`export`。

# Next

1. ~~Support hot-reload of webpack-dev-server.~~
2. ~~Support scope style of component.~~
3. ~~Support PostCSS.~~
4. Support Typescript.
5. ~~Support sourceMap.~~
6. Support dependency injection.

# License

MIT