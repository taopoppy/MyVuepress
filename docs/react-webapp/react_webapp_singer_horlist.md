# 横向分类列表

## 接收参数
在`baseUI`文件夹下新建`horizen-item`目录，接着新建`index.js`。

首先分析这个基础组件接受哪些参数，
```javascript
import React, { useState, useRef, useEffect, memo } from 'react';
import styled from'styled-components';
import Scroll from '../scroll/index'
import { PropTypes } from 'prop-types';
import style from '../../assets/global-style';

function Horizen (props) {
  return (
    // 暂时省略
  )
}

// 首先考虑接受的参数
//list 为接受的列表数据
//oldVal 为当前的 item 值
//title 为列表左边的标题
//handleClick 为点击不同的 item 执行的方法
Horizen.defaultProps = {
  list: [],
  oldVal: '',
  title: '',
  handleClick: null
};

Horizen.propTypes = {
  list: PropTypes.array,
  oldVal: PropTypes.string,
  title: PropTypes.string,
  handleClick: PropTypes.func
};
export default memo (Horizen);
```

现在，来把`props`对象进行解构赋值:
```javascript
const { list, oldVal, title } = props;
const { handleClick } = props;
```
返回的`JSX`代码为:
```javascript
return (
  <Scroll direction={"horizental"}>
    <div>
      <List>
        <span>{title}</span>
        {
          list.map ((item) => {
            return (
              <ListItem
                key={item.key}
                className={`${oldVal === item.key ? 'selected': ''}`}
                onClick={() => handleClick (item.key)}>
                  {item.name}
              </ListItem>
            )
          })
        }
      </List>
    </div>
  </Scroll>
);
```
样式代码：
```javascript
// 由于基础组件样式较少，直接写在 index.js 中
const List = styled.div`
  display: flex;
  align-items: center;
  height: 30px;
  overflow: hidden;
  >span:first-of-type {
    display: block;
    flex: 0 0 auto;
    padding: 5px 0;
    margin-right: 5px;
    color: grey;
    font-size: ${style ["font-size-m"]};
    vertical-align: middle;
  }
`
const ListItem = styled.span`
  flex: 0 0 auto;
  font-size: ${style ["font-size-m"]};
  padding: 5px 8px;
  border-radius: 10px;
  &.selected {
    color: ${style ["theme-color"]};
    border: 1px solid ${style ["theme-color"]};
    opacity: 0.8;
  }
`
```

## 载入页面
进入到`application/Singers/index.js`中，代码如下:
```javascript
import React from 'react';
import Horizen from '../../baseUI/horizen-item';
import { categoryTypes } from '../../api/config';

function Singers () {
  return (
    <Horizen list={categoryTypes} title={"分类 (默认热门):"}></Horizen>
  )
}

export default React.memo (Singers);
```

分类数据在`api/config.js`中，但现在还没定义，请到[github](https://github.com/taopoppy/cloud-music/blob/main/src/api/config.js)找到对应的代码并写入自己的项目。

## 解决滚动问题
启动项目，进入歌手列表页后，你发现这个横向列表并不能滚动，我们再回顾下`better-scroll`的 (横向) 滚动原理，首先外面容器要宽度固定，其次内容宽度要大于容器宽度。

因此目前存在两个问题:

+ <font color=#1E90FF>外部容器未限定宽度，也就是两个 Horizen 外面包裹的 div 元素。</font>
+ <font color=#1E90FF>内部宽度没有进行相应的计算，始终为屏幕宽度。</font>

现在就分别来解决这两个问题。

首先，新建`Singers/style.js`并增加：
```javascript
import styled from'styled-components';
import style from '../../assets/global-style';

export const NavContainer  = styled.div`
  box-sizing: border-box;
  position: fixed;
  top: 95px;
  width: 100%;
  padding: 5px;
  overflow: hidden;
`;
```
在`Singers/index.js`中使用:
```javascript
//...
// 返回的 JSX
return (
  <NavContainer>
    <Horizen list={categoryTypes} title={"分类 (默认热门):"}></Horizen>
    <Horizen list={alphaTypes} title={"首字母:"}></Horizen>
  </NavContainer>
)
//...
```

接下来 ，我们进入`baseUI/horizen-item/index.js`中:
```javascript
// 加入声明
const Category = useRef (null);

// 加入初始化内容宽度的逻辑
useEffect (() => {
  let categoryDOM = Category.current;
  let tagElems = categoryDOM.querySelectorAll ("span");
  let totalWidth = 0;
  Array.from (tagElems).forEach (ele => {
    totalWidth += ele.offsetWidth;
  });
  categoryDOM.style.width = `${totalWidth}px`;
}, []);

// JSX 在Scroll下面，对第一个 div 赋予 ref
<Scroll direction={"horizental"}>
  <div ref={Category}>
```

## 点击item样式改变
现在整个列表就可以滑动啦。不过还有一个问题，当我们点击某个`item`的时候，应该呈现选中样式，然后并没有，因为我们并没有在点击的时候改变`oldVal`的值。

现在进入到`Singers/index.js`中，我们加入部分逻辑后代码如下:
```javascript
import React, {useState, useCallback} from 'react';
import Horizen from '../../baseUI/horizen-item';
import { categoryTypes, alphaTypes } from '../../api/config';
import { NavContainer } from "./style";

function Singers () {
  let [category, setCategory] = useState ('');
  let [alpha, setAlpha] = useState ('');

  let handleUpdateAlpha = useCallback((val) => {
    setAlpha(val);
  })

  let handleUpdateCatetory = useCallback((val) => {
    setCategory(val);
  })

  return (
    <NavContainer>
      <Horizen
        list={categoryTypes}
        title={"分类 (默认热门):"}
        handleClick={handleUpdateCatetory}
        oldVal={category}></Horizen>
      <Horizen
        list={alphaTypes}
        title={"首字母:"}
        handleClick={val => handleUpdateAlpha (val)}
        oldVal={alpha}></Horizen>
    </NavContainer>
  )
}

export default React.memo (Singers);
```
值的注意的是我们做了一个`useCallback`的小优化，这样两个横向的`Scroll`组件在点击的时候是不会影响到另外一个重新渲染的，这个问题已经是老生常谈了。