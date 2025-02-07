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
```

## Usage

```jsx
import React from 'react';
import Splitter from '@ihatecode/react-splitter';

const App: React.FC = () => {
  return (
    <Splitter
        items={[
            {
                defaultSize:200,
                minSize:100,
                maxSize:300,
                content:<div>Left</div>
            },
            {
                defaultSize:200,
                minSize:100,
                maxSize:300,
                content:<div>Right</div>
            }]
        }
    />
  );
};

export default App;
```

## Props
#### Splitter props
|Property|Type|Optional|Default|
|-|-|:-:|:-:|
|bordered|boolean|Y|false|
|className|string|Y||
|style|object|Y||
|direction|'horizontal', 'vertical'|Y|'horizontal'|
|splitbar|object|Y||
|items|Array|N||
|onResize|(sizes: number[], percents: number[]) => void|Y||

#### Splitbar props
|Property|Type|Optional|Default|
|-|-|:-:|:-:|
|size|number|Y|1|
|color|string|Y|'#eee'|

#### Splitter Item props
|Property|Type|Optional|
|-|-|:-:|
|key|number/string|Y||
|defaultSize|number/string|Y||
|minSize|number/string|Y||
|maxSize|number/string|Y||
|content|any|Y||