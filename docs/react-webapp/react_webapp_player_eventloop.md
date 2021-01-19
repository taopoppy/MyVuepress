# 音符陨落动画

我们希望在我们点击歌曲进行播放的时候，从点击歌曲列表的地方出现一个音符掉落到底部

## musicNote动画组件封装

```javascript
//baseUI/music-note/index.js
import React, {useEffect,memo, useImperativeHandle, useRef, forwardRef } from 'react';
import styled from'styled-components';
import { prefixStyle } from './../../api/utils';
import style from '../../assets/global-style';

const Container = styled.div`
  .icon_wrapper {
    position: fixed;
    z-index: 1000;
    margin-top: -10px;
    margin-left: -10px;
    color: ${style["theme-color"]};
    font-size: 14px;
    display: none;
    transition: transform 1s cubic-bezier(.62,-0.1,.86,.57);
    transform: translate3d(0, 0, 0);
    >div {
      transition: transform 1s;
    }
  }
`

const MusicNote = forwardRef((props, ref) => {
	const iconsRef = useRef()

	// 容器中有3个音符，也就是同时只能有3个音符下落
	const ICON_NUMBER = 3;

	const transform = prefixStyle("transform");

	// 原生DOM操作，返回一个DOM节点对象
	const createNode = (txt) => {
    const template = `<div class='icon_wrapper'>${txt}</div>`;
    let tempNode = document.createElement('div');
    tempNode.innerHTML = template;
    return tempNode.firstChild;
	}

  useEffect (() => {
		// 只能同时制造三个音符
    for (let i = 0; i < ICON_NUMBER; i++){
      let node = createNode(`<div class="iconfont">&#xe642;</div>`);
      iconsRef.current.appendChild(node);
    }
    // iconsRef.current.children是一个HTMLCollection的类型，我们需要Array的类型
    let domArray = Array.from(iconsRef.current.children);
    domArray.forEach(item => {
			// running这个属性用来标识元素是否空闲
			item.running = false;
			// transitionend是过渡事件完成后触发，过渡完成后就消失
      item.addEventListener('transitionend', function(){
        this.style['display'] = 'none';
        this.style[transform] = `translate3d(0, 0, 0)`;
        this.running = false;

				// 通过createNode函数生成的DOM是<div class='icon_wrapper'><div class="iconfont">&#xe642;</div></div>
        let icon = this.querySelector('div');
        icon.style[transform] = `translate3d(0, 0, 0)`;
      }, false);
    });
    //eslint-disable-next-line
  }, []);

	const startAnimation = ({x, y}) => {
		for(let i = 0; i< ICON_NUMBER; i++ ) {
			let domArray = Array.from(iconsRef.current.children)
			let item = domArray[i]

			// 循环看看哪个音符现在是空闲的
			if(item.running === false) {
				item.style.left = x+"px"
				item.style.top = y+"px"
				item.style.display = "inline-block"
				setTimeout(() => {
					item.running = true;
					item.style[transform] = `translate3d(0, 750px, 0)`;
					let icon = item.querySelector("div");
					icon.style[transform] = `translate3d(-40px, 0, 0)`;
				}, 20)
				// 找到一个空闲的音符就跳出循环
				break
			}
		}
	}

	// 外界可以直接调用startAnimation方法，并传入动画开始的x,y坐标
	useImperativeHandle(ref, ()=> ({
		startAnimation
	}))

	return (
    <Container ref={iconsRef}>
    </Container>
  )
})

export default memo(MusicNote)
```

解释一下我为什么要用定时器？
+ <font color=#1E90FF>因为目前元素的 display 虽然变为了 inline-block, 但是元素显示出来需要・浏览器的回流 过程，无法立即显示。 也就是说元素目前还是 隐藏 的，那么 元素的位置未知，导致 transform 失效</font>

+ <font color=#1E90FF>用 setTimout 的本质将动画逻辑放到下一次的 宏任务。事实上，当本次的宏任务完成后， 会触发 浏览器 GUI 渲染线程 的重绘工作，然后才执行下一次宏任务，那么下一次宏任务中元素就显示了，transform 便能生效。</font>

这个涉及JS的`eventLoop`机制，我们会在技术专题当中去讲

## 动画运用到组件
首先我们需要改造`SongsList`组件。`SongsList`其实是一个相当关键的组件，在很多地方都需要复用，而且和播放器的数据有交互，因此单独封装成一个应用型的组件。

```javascript
import { changePlayList, changeCurrentIndex, changeSequecePlayList } from './../../application/Player/store/actionCreators';
import { connect } from 'react-redux';

//...
const { changePlayListDispatch, changeCurrentIndexDispatch, changeSequecePlayListDispatch } = props;

// 接受触发动画的函数
const { musicAnimation } = props;

// 点击歌曲列表单条信息的方法
const selectItem = (e, index) => {
  changePlayListDispatch(songs);
  changeSequecePlayListDispatch(songs);
  changeCurrentIndexDispatch(index);
  musicAnimation(e.nativeEvent.clientX, e.nativeEvent.clientY);
}
//...

// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    changePlayListDispatch(data){
      dispatch(changePlayList(data));
    },
    changeCurrentIndexDispatch(data) {
      dispatch(changeCurrentIndex(data));
    },
    changeSequecePlayListDispatch(data) {
      dispatch(changeSequecePlayList(data))
    }
  }
};

// 将 ui 组件包装成容器组件
export default connect (null, mapDispatchToProps)(React.memo (SongsList));
```

这样一来，我们就不用模拟`playList`的数据啦。我们把`player/reducer`中 `defaultState`里的`playList`和`sequenceList`置为`[]`。
```javascript
//player/index.js 中这份 mock 的代码也删除
useEffect (() => {
  changeCurrentIndexDispatch (0);
}, [])
```

### 1. 歌手页音符实现
```javascript
//Singer/index.js
import MusicNote from "../../baseUI/music-note/index";

//...
const musicNoteRef = useRef ();

const musicAnimation = (x, y) => {
  musicNoteRef.current.startAnimation({ x, y });
};

return (
  <CSSTransition>
    <Contaniner>
      // 给播放列表传递调用的musicAnimation方法
        <SongsList
          songs={songs}
          showCollect={false}
          musicAnimation={musicAnimation}
        ></SongsList>
      // 使用组件
      <MusicNote ref={musicNoteRef}></MusicNote>
    </Contaniner>
  </CSSTransition>
)
```

### 2. 歌单详情页音符实现
```javascript
//Album/index.js
import MusicNote from "../../baseUI/music-note/index";

//...
const musicNoteRef = useRef ();

const musicAnimation = (x, y) => {
  musicNoteRef.current.startAnimation ({ x, y });
};

return (
  <CSSTransition>
    <Contaniner>
      //...
        <SongsList
          songs={currentAlbum.tracks}
          collectCount={currentAlbum.subscribedCount}
          showCollect={true}
          showBackground={true}
          musicAnimation={musicAnimation}
        ></SongsList>
      //...
      <MusicNote ref={musicNoteRef}></MusicNote>
    </Contaniner>
  </CSSTransition>
)
```

现在就成功地集成了音符掉落的动画了！