# @ihatecode/react-splitter

Englist | <a href="https://github.com/zctcode/react-splitter/blob/main/README-zh_CN.md" target="_blank">中文</a>

<p>
<img alt="npm" src="https://img.shields.io/npm/v/@ihatecode/react-splitter?logo=npm&color=%234ac41c">
<img alt="npm" src="https://img.shields.io/npm/dm/@ihatecode/react-splitter?logo=npm&color=%234ac41c">
<img alt="GitHub forks" src="https://img.shields.io/github/forks/zctcode/react-splitter">
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/zctcode/react-splitter">
</p>

# Introduction
**A split pane component written in React.**

## Install
```sh
# npm
npm install @ihatecode/react-splitter
# yarn
yarn add @ihatecode/react-splitter
# pnpm
pnpm add @ihatecode/react-splitter
```

## Usage

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
                content:<div>Left</div>
            },
            {
                size:'50%',
                min:'25%',
                max:'75%',
                content:<div>Right</div>
            }]
        }
    />
  );
};

export default App;
```

## Demo
Online demo: [https://rg4jgy.csb.app/](https://rg4jgy.csb.app/)

[![Edit react-splitter](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/rg4jgy)

## Props
#### Splitter props
|Property|Type|Optional|Default|
|-|-|:-:|:-:|
|resizable|boolean|Y|true|
|className|string|Y||
|style|object|Y||
|direction|'horizontal', 'vertical'|Y|'horizontal'|
|splitbar|object|Y||
|items|Array|N||
|onResize|(sizes: { px: number, percent: number }[]) => void|Y||

#### Splitbar props
|Property|Type|Optional|Default|
|-|-|:-:|:-:|
|size|number|Y|1|
|color|string|Y|'#eee'|

#### Splitter Item props
|Property|Type|Optional|Remark|
|-|-|:-:|-|
|key|number/string|Y||
|size|number/string|Y|px: 100 or '100px';  percent: '50%'|
|min|number/string|Y|same as 'size'|
|max|number/string|Y|same as 'size'|
|resizable|boolean|Y|true|
|content|any|N||