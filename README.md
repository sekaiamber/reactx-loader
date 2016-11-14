# reactx-loader

[![travis ci](https://travis-ci.org/sekaiamber/reactx-loader.svg)](https://travis-ci.org/sekaiamber/reactx-loader) [![npm package](https://img.shields.io/npm/v/reactx-loader.svg?maxAge=2592000)](https://www.npmjs.com/package/reactx-loader)


用来加载类似[vue单文件组件](http://cn.vuejs.org/v2/guide/single-file-components.html)格式的react单文件组件的webpack loader。

# 功能

这个webpack loader允许你将react组件写成如下的格式：

![reactx component](https://raw.githubusercontent.com/sekaiamber/reactx-loader/master/doc/reactx-loader.jpg)


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

## 使用其他CSS预处理语言

```html
<style lang="sass">
  #workspace {
    color: red;
  }
</style>
```

# 配置项

在webpack的配置中可以添加`reactx`的项：

```javascript
var config = {
  reactx: {
    // 为指定语言指定loader
    loaders: {
      js: 'babel',
      coffee: 'coffee-loader',
      sass: 'style-loader!css-loader!autoprefixer?{browsers:["last 2 version", "> 1%"]}!sass'
    },
    // 是否使用source map
    sourceMap: true
  }
}
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

1. Support hot-reload of webpack-dev-server.
2. Support scope style of component.
3. Support PostCSS.