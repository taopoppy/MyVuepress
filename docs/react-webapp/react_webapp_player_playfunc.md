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