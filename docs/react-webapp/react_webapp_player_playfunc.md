# 播放功能

## 播放和暂停
关于控制播放和暂停的`playing`这个`state`我们已经是定义了，只不过还没有和播放器对接：
```javascript
useEffect(() => {
  playing ? audioRef.current.play() : audioRef.current.pause();
}, [playing]);
```
关于`audio`标签，它有很多方法和属性，其中`play`方法和`pause`方法是用来控制播放和暂停的，具体的可以在[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/audio)


现在在`mini`播放器可以看到效果，但是`normalPlayer`里面却没反应，现在补充上里面的逻辑:
```javascript
//normalPlayer/index.js
const { song, fullScreen, playing } =  props;
const { toggleFullScreen, clickPlaying } = props;

//JSX中的修改
//CdWrapper下唱片图片
<div className="cd">
  <img
    className={`image play ${playing ? "" : "pause"}`}
    src={song.al.picUrl + "?param=400x400"}
    alt=""
  />
</div>
//中间暂停按钮
<div className="icon i-center">
  <i
    className="iconfont"
		onClick={e => clickPlaying(e, !playing)}
		// dangerouslySetInnerHTML是React用來替代DOM的innerHTML
    dangerouslySetInnerHTML={{
      __html: playing ? "&#xe723;" : "&#xe731;"
    }}
  ></i>
</div>
```

## 进度控制
之前写的播放时间都是mock数据, 现在填充成动态数据。
```javascript
//父组件传值
<NormalPlayer
  song={currentSong}
  fullScreen={fullScreen}
  playing={playing}
  duration={duration} // 总时长
  currentTime={currentTime} // 播放时间
  percent={percent} // 进度
  toggleFullScreen={toggleFullScreenDispatch}
  clickPlaying={clickPlaying}
/>
```

同时有一点需要注意，就是`audio`标签在播放的过程中会不断地触发`onTimeUpdate`事件，在此需要更新`currentTime`变量。
```javascript
// Play/index.js
// 音乐播放会不停的更新当前播放时间,我们也要去不挺的更新的store的当前播放时间
const updateTime = e => {
  setCurrentTime(e.target.currentTime);
};
//JSX
<audio
  ref={audioRef}
  onTimeUpdate={updateTime}
></audio>
```

在`normalPlayer`当中
```javascript
const { song, fullScreen, playing, percent, duration, currentTime } =  props;
const { toggleFullScreen, clickPlaying, onProgressChange } = props;

//相应属性传给进度条
<ProgressWrapper>
  <span className="time time-l">{formatPlayTime(currentTime)}</span>
  <div className="progress-bar-wrapper">
    <ProgressBar
      percent={percent}
      percentChange={onProgressChange}
    ></ProgressBar>
  </div>
  <div className="time time-r">{formatPlayTime(duration)}</div>
</ProgressWrapper>
```

其中，`formatPlayTime`为`api/utils.js`中的一个工具函数：
```javascript
//转换歌曲播放时间
export const formatPlayTime = interval => {
  interval = interval | 0;// |0表示向下取整
  const minute = (interval / 60) | 0;
  const second = (interval % 60).toString().padStart(2, "0");
  return `${minute}:${second}`;
};
```

重点是传给`ProgressBar`的两个参数，一个是`percent`，用来控制进度条的显示长度，另一个是`onProgressChange`，这个其实是一个进度条被滑动或点击时用来改变`percent`的回调函数。我们在父组件来定义它：
```javascript
// Play/index.js
const onProgressChange = curPercent => {
  const newTime = curPercent * duration;
  setCurrentTime(newTime);
  audioRef.current.currentTime = newTime;
  if (!playing) {
    togglePlayingDispatch(true);
  }
};

//父组件传值
<NormalPlayer
  //...
  onProgressChange={onProgressChange}
/>
```

那么之前封装的进度条组件并没有处理`percent`相关的逻辑，现在在进度条组件中来增加，我们来编写传入组件中的`percent`变化会引起进度条和进度按钮的位置变化的函数：
```javascript
const transform = prefixStyle('transform');

const { percent } = props;
const { percentChange } = props;

//监听percent
useEffect(() => {
  if(percent >= 0 && percent <= 1 && !touch.initiated) {
    const barWidth = progressBar.current.clientWidth - progressBtnWidth;
    const offsetWidth = percent * barWidth;
    progress.current.style.width = `${offsetWidth}px`;
    progressBtn.current.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
  }
  // eslint-disable-next-line
}, [percent]);

const _changePercent = () => {
  const barWidth = progressBar.current.clientWidth - progressBtnWidth;
  const curPercent = progress.current.clientWidth / barWidth;
  percentChange(curPercent);
}

//点击和滑动结束事件改变percent
const progressClick = (e) => {
  //...
  _changePercent();
}

const progressTouchEnd = (e) => {
  //...
  _changePercent();
}
```
进度条被我们改的差不多，现在我们可以在`normalPlayer`当中通过拖动进度条和点击进度条来更改进度：

<img style="marin:auto" src="https://user-gold-cdn.xitu.io/2020/1/16/16fac32f825fb728?imageslim" alt="">


最后`mini`播放器对接一下：
```javascript
// Play/index.js
<MiniPlayer
  //...
  percent={percent}
></MiniPlayer>

//miniPlayer/index.js
const { full, song, playing, percent } = props;
//JSX
<ProgressCircle radius={32} percent={percent}>
```
做到这里大家可以完完整整地听一首歌了，实在不容易，接下来还有上一曲和下一曲的功能，我们慢慢来。


## 上下曲切换
```javascript
// Player/index.js
// 一首歌循环
const handleLoop = () => {
  audioRef.current.currentTime = 0
  // changePlayingState(true)
  togglePlayingDispatch(true)
  audioRef.current.play()
}

// 播放前一首
const handlePrev = () => {
  // 播放列表当中只有一首歌
  if(playList.length === 1) {
    handleLoop()
    return
  }
  // 播放列表当中前一首
  let index = currentIndex - 1
  if(index < 0) {
    // 当前播放歌曲如果是第一首，上一首应该是播放列表的最后一首
    index = playList.length - 1
  }
  if(!playing) {
    togglePlayingDispatch(true)
  }
  changeCurrentIndexDispatch(index)
}

// 播放下一首
const handleNext = () => {
  // 播放列表中只有一首歌
  if(playList.length === 1) {
    handleLoop()
    return
  }
  // 播放列表当中的下一首
  let index = currentIndex - 1
  if(index === playList.length) {
    // 当前播放歌曲如果是最后一首，下一首就应该是播放列表的第一首
    index = 0
  }
  if(!playing) {
    togglePlayingDispatch()
  }
  changeCurrentIndexDispatch(index)
}
```

这部分逻辑传给`normalPlayer`,因为只有在全屏播放的时候才能进行上一首和下一首的切换
```javascript
//传递给normalPlayer
handlePrev={handlePrev}
handleNext={handleNext}
```
在`normalPlayer`中绑定按钮点击事件:
```javascript
// 拿到handlePrev和handleNext
const { toggleFullScreen, clickPlaying, onProgressChange, handlePrev, handleNext } = props;

//JSX
<div className="icon i-left" onClick={handlePrev}>
  <i className="iconfont">&#xe6e1;</i>
</div>
//...
<div className="icon i-right" onClick={handleNext}>
  <i className="iconfont">&#xe718;</i>
</div>
```
现在我们把父组件中控制歌曲播放的的逻辑完善一下:
```javascript
//记录当前的歌曲，以便于下次重渲染时比对是否是一首歌
const [preSong, setPreSong] = useState({});

//先mock一份currentIndex
useEffect(() => {
  changeCurrentIndexDispatch(0);
}, [])

useEffect(() => {
  if (
    !playList.length ||
    currentIndex === -1 ||
    !playList[currentIndex] ||
    playList[currentIndex].id === preSong.id 
  )
    return;
  let current = playList[currentIndex];
  changeCurrentDispatch(current);//赋值currentSong
  setPreSong(current);
  audioRef.current.src = getSongUrl(current.id);
  setTimeout(() => {
    audioRef.current.play();
  });
  togglePlayingDispatch(true);//播放状态
  setCurrentTime(0);//从头开始播放
  setDuration((current.dt / 1000) | 0);//时长
}, [playList, currentIndex]);
```

## 播放模式
分三种: 单曲循环、顺序循环和随机播放

我们先在`Player/index.js`，也就是父组件中写相应逻辑：
```javascript
//从props中取redux数据和dispatch方法
const {
  playing,
  currentSong:immutableCurrentSong,
  currentIndex,
  playList:immutablePlayList,
  mode,//播放模式
  sequencePlayList:immutableSequencePlayList,//顺序列表
  fullScreen
} = props;

const {
  togglePlayingDispatch,
  changeCurrentIndexDispatch,
  changeCurrentDispatch,
  changePlayListDispatch,//改变playList
  changeModeDispatch,//改变mode
  toggleFullScreenDispatch
} = props;

const playList = immutablePlayList.toJS();
const sequencePlayList = immutableSequencePlayList.toJS();
const currentSong = immutableCurrentSong.toJS();
```

现在的需求是点击`normalPlayer`最左边的按钮，能够切换播放模式，我们现在在父组件写相应的逻辑。

顺便说一句。不知道你发现没有: 关于业务逻辑的部分都是在父组件完成然后直接传给子组件，而子组件虽然也有自己的状态，但大部分是控制UI层面的，逻辑都是从`props`中接受， 这也是在潜移默化中给大家展示了UI和逻辑分离的组件设计模式。通过分离关注点，解耦不同的模块，能够大量节省开发和维护成本。
```javascript
//Player/index
const changeMode = () => {
  let newMode = (mode + 1) % 3;
  if (newMode === 0) {
    //顺序模式
    changePlayListDispatch(sequencePlayList);
    let index = findIndex(currentSong, sequencePlayList);
    changeCurrentIndexDispatch(index);
  } else if (newMode === 1) {
    //单曲循环
    changePlayListDispatch(sequencePlayList);
  } else if (newMode === 2) {
    //随机播放
    let newList = shuffle(sequencePlayList);
    let index = findIndex(currentSong, newList);
    changePlayListDispatch(newList);
    changeCurrentIndexDispatch(index);
  }
  changeModeDispatch(newMode);
};
```

目前的播放列表是在组件内`mock`的，现在已经不太合适，我们把`mock`列表移动到`reducer`中的`defaultState`中，这里就不展示了，要注意`playList`和`sequenceList`都要`mock`并且`mock`一样的数据。

接下来我们来解释一下`changeMode`中的内容,`findIndex`方法用来找出歌曲在对应列表中的索引，`shuffle`方法用来打乱一个列表，达成随机列表的效果，这两个函数都定义在`api/utils.js`中。

```javascript
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// 随机算法
export function shuffle(arr) {
  let new_arr = [];
  arr.forEach(item => {
    new_arr.push(item);
  });
  for (let i = 0; i < new_arr.length; i++) {
    let j = getRandomInt(0, i);
    let t = new_arr[i];
    new_arr[i] = new_arr[j];
    new_arr[j] = t;
  }
  return new_arr;
}

// 找到当前的歌曲索引
export const findIndex = (song, list) => {
  return list.findIndex(item => {
    return song.id === item.id;
  });
};
```

接下来我们给`normalPlayer`传入:
```javascript
<NormalPlayer
  //...
  mode={mode}
  changeMode={changeMode}
/>
```
现在就需要对`normalPlayer`做一些事情了：
```javascript
//Operator标签下
<div className="icon i-left" onClick={changeMode}>
  <i
    className="iconfont"
    dangerouslySetInnerHTML={{ __html: getPlayMode() }}
  ></i>
</div>
```
```javascript
//getPlayMode方法
const getPlayMode = () => {
  let content;
  if (mode === playMode.sequence) {
    content = "&#xe625;";
  } else if (mode === playMode.loop) {
    content = "&#xe653;";
  } else {
    content = "&#xe61b;";
  }
  return content;
};

```
其中`playMode`是我们在`api/config`当中已经定义过的一个映射

功能是实现了，但是只有一个图标放在这里，可能很多用户不知道是什么意思，如果能够文字提示一下，体验会更好一些。废话不多说，直接开始封装崭新的`Toast`组件，这里只是由于是侧重项目， 不可能将`Toast`的功能面面俱到，只是让大家体会一下封装的过程，以此来提升自己的内功，这也是我不用UI框架的原因。

在`baseUI`目录下新建`Toast`文件夹:
```javascript
//Toast/index.js
import React, {useState, useImperativeHandle, forwardRef} from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import style from '../../assets/global-style';

const ToastWrapper = styled.div`
  position: fixed;
  bottom: 0;
  z-index: 1000;
  width: 100%;
  height: 50px;
  /* background: ${style["highlight-background-color"]}; */
  &.drop-enter{
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  &.drop-enter-active{
    opacity: 1;
    transition: all 0.3s;
    transform: translate3d(0, 0, 0);
  }
  &.drop-exit-active{
    opacity: 0;
    transition: all 0.3s;
    transform: translate3d(0, 100%, 0);
  }
  .text{
    line-height: 50px;
    text-align: center;
    color: #fff;
    font-size: ${style["font-size-l"]};
  }
`
//外面组件需要拿到这个函数组件的ref，因此用forwardRef
const Toast = forwardRef((props, ref) => {
  const [show, setShow] = useState(false);
  const [timer, setTimer] = useState('');
  const {text} = props;
  //外面组件拿函数组件ref的方法，用useImperativeHandle这个hook
  useImperativeHandle(ref, () => ({
    show() {
      // 做了防抖处理
      if(timer) clearTimeout(timer);
      setShow(true);
      setTimer(setTimeout(() => {
        setShow(false)
      }, 3000));
    }
  }))
  return (
    <CSSTransition in={show} timeout={300} classNames="drop" unmountOnExit>
      <ToastWrapper>
        <div className="text">{text}</div>
      </ToastWrapper>
    </CSSTransition>
  )
});

export default React.memo(Toast);
```
现在放到`Player/index.js`中使用:
```javascript
import Toast from "./../../baseUI/toast/index";

//...
const [modeText, setModeText] = useState("");

const toastRef = useRef();

//...
const changeMode = () => {
  let newMode = (mode + 1) % 3;
  if (newMode === 0) {
    //...
    setModeText("顺序循环");
  } else if (newMode === 1) {
    //...
    setModeText("单曲循环");
  } else if (newMode === 2) {
    //...
    setModeText("随机播放");
  }
  changeModeDispatch(newMode);
  toastRef.current.show();
};

//JSX
return (
  <div>
    //...
    <Toast text={modeText} ref={toastRef}></Toast>  
  </div>
)
```
<img src="https://user-gold-cdn.xitu.io/2020/1/16/16fac3421b9d1c07?imageslim" alt="">

那现在还有最后一个问题需要处理，就是歌曲播放完了之后，紧接着需要怎么处理。

我们回到父组件，把这个处理逻辑写在`audio`标签的`onEnded`事件回调中:
```javascript
<audio
  ref={audioRef}
  onTimeUpdate={updateTime}
  onEnded={handleEnd}
></audio>
```
基本的逻辑就是，当前歌曲播放完毕，如果是处于循环播放的条件下就重新循环，如果不是，就下一首：
```javascript
import { playMode } from '../../api/config';
//...
const handleEnd = () => {
  if (mode === playMode.loop) {
    handleLoop();
  } else {
    handleNext();
  }
};
```
