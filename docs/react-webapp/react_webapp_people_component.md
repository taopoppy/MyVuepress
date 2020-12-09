# UI组件开发

## 改造路由
在`routes/index.js`中，添加如下：
```javascript
import Singer from '../application/Singer';

//...
{
  path: "/singers",
  component: Singers,
  key: "singers",
  routes: [
    {
      path: "/singers/:id",
      component: Singer
    }
  ]
}
```
我们需要新建`Singer`文件夹，其中的`index.js`如下：
```javascript
import React from 'react';

function Singer (props) {
  return (
    <div>Singer</div>
  )
}

export default Singer;
```
接下来我们需要在以前的歌手列表组件中添加以下跳转逻辑：
```javascript
const enterDetail = (id)  => {
  props.history.push (`/singers/${id}`);
};

//...
<ListItem key={item.accountId+""+index} onClick={() => enterDetail (item.id)}>
```
当然，不要忘了这一句，否则作为子路由下的`Singer`组件无法渲染:
```javascript
//Singers/index.js
import { renderRoutes } from 'react-router-config';

//...
return (
  <div>
    //...
    { renderRoutes (props.route.routes) }
  </div> 
)
```

## 路由跳转动画
```javascript
import React, { useState } from "react";
import { CSSTransition } from "react-transition-group";
import { Container } from "./style";

function Singer (props) {
  const [showStatus, setShowStatus] = useState (true);

  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={() => props.history.goBack ()}
    >
      <Container>
      </Container>
    </CSSTransition>
  )
}

export default Singer;
```
样式文件内容`style.js`如下：
```javascript
import styled from'styled-components';
import style from '../../assets/global-style';

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: ${props => props.play > 0 ? "60px": 0};
  width: 100%;
  z-index: 100;
  overflow: hidden;
  background: #f2f3f4;
  transform-origin: right bottom;
  &.fly-enter, &.fly-appear {
    transform: rotateZ (30deg) translate3d (100%, 0, 0);
  }
  &.fly-enter-active, &.fly-appear-active {
    transition: transform .3s;
    transform: rotateZ (0deg) translate3d (0, 0, 0);
  }
  &.fly-exit {
    transform: rotateZ (0deg) translate3d (0, 0, 0);
  }
  &.fly-exit-active {
    transition: transform .3s;
    transform: rotateZ (30deg) translate3d (100%, 0, 0);
  }
`
```

## 核心布局开发
返回的`JSX`结构如下:
```javascript
<CSSTransition
  in={showStatus}
  timeout={300}
  classNames="fly"
  appear={true}
  unmountOnExit
  onExited={() => props.history.goBack ()}
>
  <Container>
    <Header title={"头部"}></Header>
    <ImgWrapper bgUrl={artist.picUrl}>
      <div className="filter"></div>
    </ImgWrapper>
    <CollectButton>
      <i className="iconfont">&#xe62d;</i>
      <span className="text"> 收藏 </span>
    </CollectButton>
    <BgLayer></BgLayer>
    <SongListWrapper>
      // 歌曲列表部分，待会专门拆解
    </SongListWrapper>
  </Container>
</CSSTransition>
```

`ImgWrapper`中有一个比较特殊的处理，将图片设为这个容器的背景，然后里面放置跟容器一样大的`div`，这个`div`颜色偏深，来对图片的色调进行修饰。
```javascript
export const ImgWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 75%;
  transform-origin: top;
  background: url (${props => props.bgUrl});
  background-size: cover;
  z-index: 50;
  .filter {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba (7, 17, 27, 0.3);
  }
`
```

`CollectButton`即收藏的按钮，相对于`Container`绝对定位，以`left`、`right`各为0，`margin`设为`auto`的方式实现水平居中。
```javascript
export const CollectButton = styled.div`
  position: absolute;
  left: 0; right: 0;
  margin: auto;
  box-sizing: border-box;
  width: 120px;
  height: 40px;
  margin-top: -55px;
  z-index:50;
  background: ${style ["theme-color"]};
  color: ${style ["font-color-light"]};
  border-radius: 20px;
  text-align: center;
  font-size: 0;
  line-height: 40px;
  .iconfont {
    display: inline-block;
    margin-right: 10px;
    font-size: 12px;
    vertical-align: 1px;
  }
  .text {
    display: inline-block;
    font-size:14px;
    letter-spacing: 5px;
  }
`
```
歌曲列表容器，比较简单:
```javascript
export const SongListWrapper = styled.div`
  position: absolute;
  z-index: 50;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  >div {
    position: absolute;
    left: 0;
    width: 100%;
    overflow: visible;
  }
`
```
白色背景遮罩，是本部分的亮点
```javascript
export const BgLayer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background: white;
  border-radius: 10px;
  z-index: 50;
`
```

## 歌曲列表组件重构
之前在推荐歌单部分，我们用到了歌曲列表，这里我们可以把这样的列表抽离出来，做一下组件的复用。

`application`目录下新建`SongList`组件 (由于之后和播放器组件的数据交互较多，我们放到 `application`目录)
```javascript
import React from 'react';
import { SongList, SongItem } from "./style";
import { getName } from '../../api/utils';

const SongsList = React.forwardRef ((props, refs)=> {

  const { collectCount, showCollect, songs } = props;

  const totalCount = songs.length;

  const selectItem = (e, index) => {
    console.log (index);
  }

  let songList = (list) => {
    let res = [];
    for (let i = 0; i < list.length; i++) {
      let item = list [i];
      res.push (
        <li key={item.id} onClick={(e) => selectItem (e, i)}>
          <span className="index">{i + 1}</span>
          <div className="info">
            <span>{item.name}</span>
            <span>
              { item.ar ? getName (item.ar): getName (item.artists) } - { item.al ? item.al.name : item.album.name}
            </span>
          </div>
        </li>
      )
    }
    return res;
  };

  const collect = (count) => {
    return  (
      <div className="add_list">
        <i className="iconfont">&#xe62d;</i>
        <span > 收藏 ({Math.floor (count/1000)/10} 万)</span>
      </div>
    )
  };
  return (
    <SongList ref={refs} showBackground={props.showBackground}>
      <div className="first_line">
        <div className="play_all" onClick={(e) => selectItem (e, 0)}>
          <i className="iconfont">&#xe6e3;</i>
          <span > 播放全部 <span className="sum">(共 {totalCount} 首)</span></span>
        </div>
        { showCollect ? collect (collectCount) : null}
      </div>
      <SongItem>
        { songList (songs) }
      </SongItem>
    </SongList>
  )
});

export default React.memo (SongsList);
```
样式代码稍微做一下处理：
```javascript
import styled from'styled-components';
import style from '../../assets/global-style';

export const SongList = styled.div`
  border-radius: 10px;
  opacity: 0.98;
  // 注意在这里背景改为自配置参数控制
  ${props => props.showBackground ? `background: ${style ["highlight-background-color"]}`: ""}
  .first_line {
    box-sizing: border-box;
    padding: 10px 0;
    margin-left: 10px;
    position: relative;
    justify-content: space-between;
    border-bottom: 1px solid ${style ["border-color"]};
    .play_all {
      display: inline-block;
      line-height: 24px;
      color: ${style ["font-color-desc"]};
      .iconfont {
        font-size: 24px;
        margin-right: 10px;
        vertical-align: top;
      }
      .sum {
        font-size: ${style ["font-size-s"]};
        color: ${style ["font-color-desc-v2"]};
      }
      >span {
        vertical-align: top;
      }
    }
    .add_list,.isCollected {
      display: flex;
      align-items: center;
      position: absolute;
      right: 0; top :0; bottom: 0;
      width: 130px;
      line-height: 34px;
      background: ${style ["theme-color"]};
      color: ${style ["font-color-light"]};
      font-size: 0;
      border-radius: 3px;
      vertical-align: top;
      .iconfont {
        vertical-align: top;
        font-size: 10px;
        margin: 0 5px 0 10px;
      }
      span {
        font-size: 14px;
        line-height: 34px;
      }
    }
    .isCollected {
      display: flex;
      background: ${style ["background-color"]};
      color: ${style ["font-color-desc"]};
    }
}
`
export const SongItem = styled.ul`
  >li {
    display: flex;
    height: 60px;
    align-items: center;  
    .index {
      flex-basis: 60px;
      width: 60px;
      height: 60px;
      line-height: 60px;
      text-align: center;
    }
    .info {
      box-sizing: border-box;
      flex: 1;
      display: flex;
      height: 100%;
      padding: 5px 0;
      flex-direction: column;
      justify-content: space-around;
      border-bottom: 1px solid ${style ["border-color"]};
      ${style.noWrap ()}
      >span {
        ${style.noWrap ()}
      }
      >span:first-child {
        color: ${style ["font-color-desc"]};
      }
      >span:last-child {
        font-size: ${style ["font-size-s"]};
        color: #bba8a8;
      }
    }
  }
`
```
