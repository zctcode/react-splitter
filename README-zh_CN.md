# @ihatecode/react-splitter

<a href="https://github.com/zctcode/react-splitter/blob/main/README.md" target="_blank">Englist</a> | 中文

<p>
<img alt="npm" src="https://img.shields.io/npm/v/@ihatecode/react-splitter?logo=npm&color=%234ac41c">
<img alt="npm" src="https://img.shields.io/npm/dm/@ihatecode/react-splitter?logo=npm&color=%234ac41c">
<img alt="GitHub forks" src="https://img.shields.io/github/forks/zctcode/react-splitter">
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/zctcode/react-splitter">
</p>

# 介绍
**一个用 React 编写的分割窗格组件**

## 安装
```sh
# npm
npm install @ihatecode/react-splitter
# yarn
yarn add @ihatecode/react-splitter
# pnpm
pnpm add @ihatecode/react-splitter
```

## 使用

```jsx
import React from 'react';
import Splitter from '@ihatecode/react-splitter';
import '@ihatecode/react-splitter/lib/style.css';

const App: React.FC = () => {
  return (
      <Splitter
        items={[
            {
                size:200,
                min:100,
                max:300,
                content:<div>左</div>
            },
            {
                size:'50%',
                min:'25%',
                max:'75%',
                content:<div>右</div>
            }]
        }
    />
  );
};

export default App;
```

## 示例
在线预览: [https://rg4jgy.csb.app/](https://rg4jgy.csb.app/)

[![Edit react-splitter](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/rg4jgy)

## 属性
#### Splitter props
|参数|说明|类型|是否必须|默认值|
|-|-|-|:-:|:-:|
|resizable|是否可调整大小|boolean|否|true|
|className|自定义样式|string|否||
|style|自定义样式|object|否||
|direction|分割方向，可选值：'horizontal'、'vertical'|string|否|'horizontal'|
|splitbar|分割条配置|object|否||
|items|分割内容配置|Array|是||
|onResize|分割条拖动回调|(sizes: { px: number, percent: number }[]) => void|否||

#### Splitbar props
|参数|说明|类型|是否必须|默认值|
|-|-|-|:-:|:-:|
|size|分割条宽度|number|否|1|
|color|分割条颜色|string|否|'#eee'|

#### Splitter item props
|参数|说明|类型|是否必须|默认值|
|-|-|-|:-:|:-:|
|key|分割内容唯一标识|number/string|否||
|size|默认大小|number/string|否||
|min|最小大小|number/string|否||
|max|最大大小|number/string|否||
|resizable|是否可调整大小|boolean|否|true|
|content|分割内容|any|是||