# 播放歌曲

## mini播放强
`mini`播放器目前依赖的数据是播放状态和播放进度数据。
```javascript
// song是当前播放歌曲信息， fullScreen是当前是否为全屏模式，playing是当前播放状态，percent是播放进度数据
const { song, fullScreen, playing, percent  } = props; 
// clickPlaying是mini播放器当中的播放和暂停的按钮点击函数
const { clickPlaying, setFullScreen } = props;
```

进度条这里的JSX代码也需要修改一下:
```javascript
// 暂停的时候唱片也停止旋转
<img className={`play ${playing ? "": "pause"}`} src={song.al.picUrl} width="40" height="40" alt="img"/>
```
```javascript
<ProgressCircle radius={32} percent={percent}>
  { playing ? 
    <i className="icon-mini iconfont icon-pause" onClick={e => clickPlaying(e, false)}>&#xe650;</i>
    :
    <i className="icon-mini iconfont icon-play" onClick={e => clickPlaying(e, true)}>&#xe61e;</i>
  }
</ProgressCircle>
```

当然在父组件中也要做相应修改:
```javascript
// Play/index.js
// 播放器当中播放和暂停按钮点击事件
const clickPlaying = (e, state) => {
	e.stopPropagation() // 阻止捕获和冒泡阶段中当前事件的进一步传播。因为整个mini播放器也有点击事件
	togglePlayingDispatch(state) // 提交修改歌曲播放状态的action
}
return (
  <div>
    <MiniPlayer
      song={currentSong}
      fullScreen={fullScreen}
      playing={playing}
      toggleFullScreen={toggleFullScreenDispatch}
      clickPlaying={clickPlaying}
    />
    <NormalPlayer
      song={currentSong}
      fullScreen={fullScreen}
      playing={playing}
      toggleFullScreen={toggleFullScreenDispatch}
      clickPlaying={clickPlaying}
    />
  </div>
)
```

## Normal播放器
Ok, 现在我们来处理更复杂的全屏播放器部分。

首先定义必要的播放器属性:
```javascript
//Player/index.js

//目前播放时间
const [currentTime, setCurrentTime] = useState(0);
//歌曲总时长
const [duration, setDuration] = useState(0);
//歌曲播放进度
let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration;
```

同时需要接受`redux`中的`currentIndex`:
```javascript
// Play/index.js
const { fullScreen, playing, currentIndex, currentSong: immutableCurrentSong } = props;
const { toggleFullScreenDispatch, togglePlayingDispatch, changeCurrentIndexDispatch, changeCurrentDispatch } = props;

let currentSong = immutableCurrentSong.toJS();
```

我们现在的当务之急是让播放器能够播放, 所以现在我们需要放上我们的核心元素————`audio`标签:
```javascript
//绑定ref
const audioRef = useRef();

return (
  <div>
    //...
    <audio ref={audioRef}></audio>
  </div>
)
```
现在先写一些逻辑:
```javascript
//mock一份playList，后面直接从 redux 拿，现在只是为了调试播放效果。
const playList = [
    {
      ftype: 0,
      djId: 0,
      a: null,
      cd: '01',
      crbt: null,
      no: 1,
      st: 0,
      rt: '',
      cf: '',
      alia: [
        '手游《梦幻花园》苏州园林版推广曲'
      ],
      rtUrls: [],
      fee: 0,
      s_id: 0,
      copyright: 0,
      h: {
        br: 320000,
        fid: 0,
        size: 9400365,
        vd: -45814
      },
      mv: 0,
      al: {
        id: 84991301,
        name: '拾梦纪',
        picUrl: 'http://p1.music.126.net/M19SOoRMkcHmJvmGflXjXQ==/109951164627180052.jpg',
        tns: [],
        pic_str: '109951164627180052',
        pic: 109951164627180050
      },
      name: '拾梦纪',
      l: {
        br: 128000,
        fid: 0,
        size: 3760173,
        vd: -41672
      },
      rtype: 0,
      m: {
        br: 192000,
        fid: 0,
        size: 5640237,
        vd: -43277
      },
      cp: 1416668,
      mark: 0,
      rtUrl: null,
      mst: 9,
      dt: 234947,
      ar: [
        {
          id: 12084589,
          name: '妖扬',
          tns: [],
          alias: []
        },
        {
          id: 12578371,
          name: '金天',
          tns: [],
          alias: []
        }
      ],
      pop: 5,
      pst: 0,
      t: 0,
      v: 3,
      id: 1416767593,
      publishTime: 0,
      rurl: null
    }
];
useEffect(() => {
  if(!currentSong) return;
  changeCurrentIndexDispatch(0);//currentIndex默认为-1，临时改成0
  let current = playList[0];
  changeCurrentDispatch(current);//赋值currentSong,将播放列表的第一项作为当前要播放的歌曲
  audioRef.current.src = getSongUrl(current.id);// 获取到歌曲
  setTimeout(() => {
    audioRef.current.play();
  });
  togglePlayingDispatch(true);//播放状态
  setCurrentTime(0);//从头开始播放
  setDuration((current.dt / 1000) | 0);//时长
}, []);
```

其中，`getSongUrl`为一个封装在`api/utils.js`中的方法:
```javascript
//拼接出歌曲的url链接
export const getSongUrl = id => {
  return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
};
```

但是这样书写的时候会报错，这是因为初始化`store`数据的时候，`currentSong`是一个空对象，`song.al`为`undefined`, 因此`song.al.picUrl`就会报错。

很简单，我们在渲染播放器的时候判断一下`currentSong`是否对空对象就可以了。如果是空对象，我们就不渲染播放器：
```javascript
import { isEmptyObject } from "../../api/utils";

//JSX
return (
  <div>
    { isEmptyObject(currentSong) ? null :
      <MiniPlayer
        song={currentSong}
        fullScreen={fullScreen}
        playing={playing}
        toggleFullScreen={toggleFullScreenDispatch}
        clickPlaying={clickPlaying}
      />
    }
    { isEmptyObject(currentSong) ? null :
      <NormalPlayer
        song={currentSong}
        fullScreen={fullScreen}
        playing={playing}
        toggleFullScreen={toggleFullScreenDispatch}
        clickPlaying={clickPlaying}
      />
    }
    <audio ref={audioRef}></audio>
  </div>
)
```

好，现在你打开项目应该可以听到背景音乐了，现在我们迈出了第一步。接下来就是一步步不断地完善播放的逻辑。