# 进出场动画

我们知道对于播放器来说，有一个在底部的缩小版播放器，和一个能够全屏并且支持各种功能的的完整本播放器，我们分别称为`miniPlayer`和`nomalPlayer`，接着我们先来开发`miniPlayer`

## miniPlayer
首先在`Player`目录下新建`miniPlayer`子目录:
```javascript
//miniPlayer/index.js
import React from 'react';
import {getName} from '../../../api/utils';
import { MiniPlayerContainer } from './style';

function MiniPlayer (props) {
  const { song } = props;
  return (
      <MiniPlayerContainer>
        <div className="icon">
          <div className="imgWrapper">
            <img className="play" src={song.al.picUrl} width="40" height="40" alt="img"/>
          </div>
        </div>
        <div className="text">
          <h2 className="name">{song.name}</h2>
          <p className="desc">{getName(song.ar)}</p>
        </div>
        <div className="control">
          <i className="iconfont">&#xe650;</i>
        </div>
        <div className="control">
          <i className="iconfont">&#xe640;</i>
        </div>
      </MiniPlayerContainer>
  )
}

export default React.memo(MiniPlayer);
```
样式组件对应如下，在`style.js`中：
```javascript
import styled, { keyframes } from'styled-components';
import style from '../../../assets/global-style';

const rotate = keyframes`
  0%{
    transform: rotate(0);
  }
  100%{
    transform: rotate(360deg);
  }
`

export const MiniPlayerContainer = styled.div`
  display: flex;
  align-items: center;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 1000;
  width: 100%;
  height: 60px;
  background: ${style["highlight-background-color"]};
  &.mini-enter {
    transform: translate3d(0, 100%, 0);
  }
  &.mini-enter-active {
    transform: translate3d(0, 0, 0);
    transition: all 0.4s;
  }
  &.mini-exit-active {
    transform: translate3d(0, 100%, 0);
    transition: all .4s
  }
  .icon {
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    padding: 0 10px 0 20px;
    .imgWrapper {
      width: 100%;
      height: 100%;
      img {
        border-radius: 50%;
        &.play {
          animation: ${rotate} 10s infinite;
          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }
  }
  .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    line-height: 20px;
    overflow: hidden;
    .name {
      margin-bottom: 2px;
      font-size: ${style["font-size-m"]};
      color: ${style["font-color-desc"]};
      ${style.noWrap()}
    }
    .desc {
      font-size: ${style["font-size-s"]};
      color: ${style["font-color-desc-v2"]};
      ${style.noWrap()}
    }
  }
  .control {
    flex: 0 0 30px;
    padding: 0 10px;
    .iconfont, .icon-playlist {
      font-size: 30px;
      color: ${style["theme-color"]};
    }
    .icon-mini {
      font-size: 16px;
      position: absolute;
      left: 8px;
      top: 8px;
      &.icon-play {
        left: 9px
      }
    }
  }
`
```
然后将其引入到`Player`当中：
```javascript
import MiniPlayer from './miniPlayer';

function Player (props) {
	// mock的假数据
  const currentSong = {
    al: { picUrl: "https://p1.music.126.net/JL_id1CFwNJpzgrXwemh4Q==/109951164172892390.jpg" },
    name: "木偶人",
    ar: [{name: "薛之谦"}]
  }
  return (
    <div>
      <MiniPlayer song={currentSong}/>
    </div>
  )
}
//...
```

## nomalPlayer
我们首先来大致布局一下：
```javascript
//normalPlayer/index.js
import React from "react";
import {  getName } from "../../../api/utils";
import {
  NormalPlayerContainer,
  Top,
  Middle,
  Bottom,
  Operators,
  CDWrapper,
} from "./style";

function NormalPlayer(props) {
  const {song} =  props;
  return (
    <NormalPlayerContainer>
      <div className="background">
        <img
          src={song.al.picUrl + "?param=300x300"}
          width="100%"
          height="100%"
          alt="歌曲图片"
        />
      </div>
      <div className="background layer"></div>
      <Top className="top">
        <div className="back">
          <i className="iconfont icon-back">&#xe662;</i>
        </div>
        <h1 className="title">{song.name}</h1>
        <h1 className="subtitle">{getName(song.ar)}</h1>
      </Top>
      <Middle>
        <CDWrapper>
          <div className="cd">
            <img
              className="image play"
              src={song.al.picUrl + "?param=400x400"}
              alt=""
            />
          </div>
        </CDWrapper>
      </Middle>
      <Bottom className="bottom">
        <Operators>
          <div className="icon i-left" >
            <i className="iconfont">&#xe625;</i>
          </div>
          <div className="icon i-left">
            <i className="iconfont">&#xe6e1;</i>
          </div>
          <div className="icon i-center">
            <i className="iconfont">&#xe723;</i>
          </div>
          <div className="icon i-right">
            <i className="iconfont">&#xe718;</i>
          </div>
          <div className="icon i-right">
            <i className="iconfont">&#xe640;</i>
          </div>
        </Operators>
      </Bottom>
    </NormalPlayerContainer>
  );
}
export default React.memo(NormalPlayer);
```

相应的`style.js`如下：
```javascript
import styled, { keyframes } from "styled-components";
import style from "../../../assets/global-style";

const rotate = keyframes`
  0%{
    transform: rotate (0);
  }
  100%{
    transform: rotate (360deg);
  }
`;
export const NormalPlayerContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 150;
  background: ${style ["background-color"]};
  .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.6;
    filter: blur (20px);
    &.layer {
      background: ${style ["font-color-desc"]};
      opacity: 0.3;
      filter: none;
    }
  }
`;
export const Top = styled.div`
  position: relative;
  margin-bottom: 25px;
  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;
    .iconfont {
      display: block;
      padding: 9px;
      font-size: 24px;
      color: ${style["font-color-desc"]};
      font-weight: bold;
      transform: rotate (90deg);
    }
  }
  .title {
    width: 70%;
    margin: 0 auto;
    line-height: 40px;
    text-align: center;
    font-size: ${style["font-size-l"]};
    color: ${style["font-color-desc"]};
    ${style.noWrap()};
  }
  .subtitle {
    line-height: 20px;
    text-align: center;
    font-size: ${style["font-size-m"]};
    color: ${style["font-color-desc-v2"]};
    ${style.noWrap()};
  }
`;
export const Middle = styled.div`
  position: fixed;
  width: 100%;
  top: 80px;
  bottom: 170px;
  white-space: nowrap;
  font-size: 0;
  overflow: hidden;
`;
export const CDWrapper = styled.div`
  position: absolute;
  margin: auto;
  top: 10%;
  left: 0;
  right: 0;
  width: 80%;
  box-sizing: border-box;
  height: 80vw;
  .cd {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    .image {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border-radius: 50%;
      border: 10px solid rgba (255, 255, 255, 0.1);
    }
    .play {
      animation: ${rotate} 20s linear infinite;
      &.pause {
        animation-play-state: paused;
      }
    }
  }
  .playing_lyric {
    margin-top: 20px;
    font-size: 14px;
    line-height: 20px;
    white-space: normal;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
  }
`;

export const Bottom = styled.div`
  position: absolute;
  bottom: 50px;
  width: 100%;
`;
export const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 80%;
  margin: 0px auto;
  padding: 10px 0;
  .time {
    color: ${style["font-color-desc"]};
    font-size: ${style["font-size-s"]};
    flex: 0 0 30px;
    line-height: 30px;
    width: 30px;
    &.time-l {
      text-align: left;
    }
    &.time-r {
      text-align: right;
    }
  }
  .progress-bar-wrapper {
    flex: 1;
  }
`;
export const Operators = styled.div`
  display: flex;
  align-items: center;
  .icon {
    font-weight: 300;
    flex: 1;
    color: ${style["font-color-desc"]};
    &.disable {
      color: ${style["theme-color-shadow"]};
    }
    i {
      font-weight: 300;
      font-size: 30px;
    }
  }
  .i-left {
    text-align: right;
  }
  .i-center {
    padding: 0 20px;
    text-align: center;
    i {
      font-size: 40px;
    }
  }
  .i-right {
    text-align: left;
  }
  .icon-favorite {
    color: ${style["theme-color"]};
  }
`;
```
其中关于`css`动画的内容，我们在最前面的专题当中有详细的`css`三种动画详解。

## Player进入场动画
既然是要进场，那就必须涉及到状态的改变了，具体来说我们现在需要拿出`redux`中的`fullScreen`并做相应的改变。由于父组件连接了`redux`，现在`normalPlayer`只需从父组件接受相应的变量和方法即可。

首先在`Player`组件当中传递`props`：
```javascript
// Player/index.js
function Player (props) {
  const { fullScreen } = props;

  const { toggleFullScreenDispatch } = props;

  //...
  return (
    <div> 
      <MiniPlayer
        song={currentSong}
        fullScreen={fullScreen}
        toggleFullScreen={toggleFullScreenDispatch}
      />
      <NormalPlayer
        song={currentSong}
        fullScreen={fullScreen}
        toggleFullScreen={toggleFullScreenDispatch}
      />
    </div>
  )
}
```
### 1. miniPlayer的进入场动画
关于完整版播放器`normalPlayer`的进场动画实际涉及到`miniPlayer`的出场动画和`normalPlayer`的进场动画，我们先来解决`miniPlayer`的出场动画：

首先`miniPlayer`里面，当`fullScreen`为`false`的时候应该不显示，我们也可以运用一下`CSSTransition`：
```javascript
const miniPlayerRef = useRef ();

return (
  <CSSTransition 
    in={!fullScreen} 
    timeout={400} 
    classNames="mini" 
    onEnter={() => {
      miniPlayerRef.current.style.display = "flex";
    }}
    onExited={() => {
      miniPlayerRef.current.style.display = "none";
    }}
  >
    <MiniPlayerContainer ref={miniPlayerRef} onClick={() => toggleFullScreen (true)}>
      // 其余代码不变 
    </MiniPlayerContainer>
  </CSSTransition>
)
```
关于`mini`动画钩子类在`style.js`中如下声明:
```css
//NormalPlayerContainer 组件下
&.mini-enter {
  transform: translate3d(0, 100%, 0);
}
&.mini-enter-active {
  transform: translate3d(0, 0, 0);
  transition: all 0.4s;
}
&.mini-exit-active {
  transform: translate3d(0, 100%, 0);
  transition: all .4s
}
```

### 2. normalPlayer的进人场动画
接下来需要用到`JS`的帧动画插件`create-keyframe-animation`
```javascript
npm install create-keyframe-animation --save
```

```javascript
import React,{ memo, useCallback, useRef } from "react";
import {  getName } from "../../../api/utils";
import { CSSTransition } from 'react-transition-group'
import animations from 'create-keyframe-animation'
import { prefixStyle } from '../../../api/utils'
import {
  NormalPlayerContainer,
  Top,
  Middle,
  Bottom,
  Operators,
  CDWrapper,
} from "./style";

function NormalPlayer(props) {
	const { song, fullScreen } = props;
	const { toggleFullScreen } = props

	const normalPlayerRef = useRef();
	const cdWrapperRef = useRef();

	const transform = prefixStyle("transform");

	// 计算偏移的辅助函数
	const _getPosAndScale = useCallback(() => {
		const targetWidth = 40; // 圆的宽度，或者圆的直径是40
		const paddingLeft = 40; // miniPlay当中的圆心的x坐标是40，因为左边距是20,圆的半径是20
		const paddingBottom = 30; // miniPlay当中的圆心的y坐标是30,因为圆的半径是20，然后整个miniPlay是高60，减去圆的直径40，上下各有10的边距
		const paddingTop = 80; // normal整体上边距是80px
		const width = window.innerWidth * 0.8; // normal当中的大圆直径为视口宽度的80%
		const scale = targetWidth /width; // mini当中的小圆的直径除以normal当中的大圆的直径就是缩放比
		// 两个圆心的横坐标距离和纵坐标距离
		const x = -(window.innerWidth/ 2 - paddingLeft); // normalPlay的圆心就在中央，所以是window.innerWidth/ 2
		const y = window.innerHeight - paddingTop - width / 2 - paddingBottom; // normalPlay的圆心的y坐标用整体视口的高度-标题的高度-圆的半径-标题下面整体的上内边距
		return {
			x,
			y,
			scale
		};
	},[]);

	// 进入动画
	const enter = () => {
		normalPlayerRef.current.style.display = "block"
		const { x, y, scale } = _getPosAndScale()
		let animation = {
			0: {
				transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
			},
			60: {
				transform: `translate3d(0, 0, 0) scale(1.1)`
			},
			100: {
				transform: `translate3d(0, 0, 0) scale(1)`
			}
		}
		// 注册一个动画
		animations.registerAnimation({
			name: "move", // 名称叫move
			animation, // 实际动画的keyframes
			presets: { // 可选项
				duration: 400, // 动画时间400ms
				easing: "linear" // 动画函数linear
			}
		});
		// 将动画附加在某个DOM节点上面（将上面注册的move动画附加在normalPlay中的大圆上，默认只有一次）
		animations.runAnimation(cdWrapperRef.current, "move");
	}

	// 进入动画后
	const afterEnter = () => {
		const cdWrapperDom = cdWrapperRef.current;
		animations.unregisterAnimation("move") // 消除注册的move动画
		cdWrapperDom.style.animation = ""; // normalPlay中的大圆的动画暂时为空
	}

	// 离开动画前
	const leave = () => {
		if (!cdWrapperRef.current) return;
		const cdWrapperDom = cdWrapperRef.current;
		cdWrapperDom.style.transition = "all 0.4s";
		const { x, y, scale } = _getPosAndScale();
		cdWrapperDom.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
	};

	// 离开动画后
	const afterLeave = () => {
		if (!cdWrapperRef.current) return;
		const cdWrapperDom = cdWrapperRef.current;
		cdWrapperDom.style.transition = "";
		cdWrapperDom.style[transform] = "";
		// 一定要注意现在要把normalPlayer这个DOM给隐藏掉，因为CSSTransition的工作只是把动画执行一遍
		// 不置为 none 现在全屏播放器页面还是存在
		normalPlayerRef.current.style.display = "none";
	};


  return (
		<CSSTransition
			classNames="normal"
			in={fullScreen} // 动画的状态
			timeout={400}
			mountOnEnter
			onEnter={enter} // 1. 进入前
			onEntered={afterEnter} // 2.进入后
			onExit={leave} // 3. 出场前
			onExited={afterLeave} // 4. 出场后
		>
			<NormalPlayerContainer ref={normalPlayerRef}>
				...
				<Top className="top">
					<div className="back" onClick={()=> {toggleFullScreen(false)}}>
						<i className="iconfont icon-back">&#xe662;</i>
					</div>
					<h1 className="title">{song.name}</h1>
					<h1 className="subtitle">{getName(song.ar)}</h1>
				</Top>
				<Middle ref={cdWrapperRef}>
					<CDWrapper>
						...
					</CDWrapper>
				</Middle>
				<Bottom className="bottom">
					...
				</Bottom>
			</NormalPlayerContainer>
		</CSSTransition>
  );
}

export default memo(NormalPlayer);
```
从上面最直观的看出来就是我们使用了`create-keyframe-animation`对进入页面之后进一层的动画效果进行了描述，<font color=#9400D3>我们现在在React当中使用的动画库就已经有Animate.css、react-transition-group、create-keyframe-animation</font>，其中具体的用法，都已经在整个过程当中做了详细的描述。

另外我们针对上面的动画结果进行一下展示：

<img src="https://user-gold-cdn.xitu.io/2019/10/26/16e0800fb44c5345?imageslim" alt="">

最后我们声明：<font color=#1E90FF>我们实现的出场动画是基于transform属性的，但是transform在不同的浏览器厂商会有不同的前缀，这个问题在CSS中可以用postcss等工具来解决，但是JS中我们现在只有自己来处理了。</font>

在`api/utils.js`中添加:
```javascript
// 给 css3 相关属性增加浏览器前缀，处理浏览器兼容性问题
let elementStyle = document.createElement ("div").style;

let vendor = (() => {
  // 首先通过 transition 属性判断是何种浏览器
  let transformNames = {
    webkit: "webkitTransform",
    Moz: "MozTransform",
    O: "OTransfrom",
    ms: "msTransform",
    standard: "Transform"
  };
  for (let key in transformNames) {
    if (elementStyle [transformNames [key]] !== undefined) {
      return key;
    }
  }
  return false;
})();

export function prefixStyle (style) {
  if (vendor === false) {
    return false;
  }
  if (vendor === "standard") {
    return style;
  }
  return vendor + style.charAt (0).toUpperCase () + style.substr (1);
}
```
