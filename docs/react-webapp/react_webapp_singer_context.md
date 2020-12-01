# Context缓存

当我们切换`tab`之中，你会发现，对于歌手列表当中我们选择歌手的类型是无法保存的，也许你马上就想到了`redux`，这当然可以，但如果真要用这个，我也就没有说的必要了。

其实也是为了拓展一下大家的思路，全局的状态管理不仅仅可以用`redux`，`react hooks`同样可以模拟出这种功能。现在我们就用`hooks`中的`useContext`结合`useReducer`打造出类似`redux`的状态管理功能。

## hooks实现简易redux
在`Singers`目录下新建一个文件`data.js`, 模拟一个简单的`redux`代码如下：
```javascript
import React, {createContext, useReducer} from 'react';
import { fromJS } from 'immutable';

//context
export const CategoryDataContext = createContext ({});

// 相当于之前的 constants
export const CHANGE_CATEGORY = 'singers/CHANGE_CATEGORY';
export const CHANGE_ALPHA = 'singers/CHANGE_ALPHA';

//reducer 纯函数
const reducer = (state, action) => {
  switch (action.type) {
    case CHANGE_CATEGORY:
      return state.set ('category', action.data);
    case CHANGE_ALPHA:
      return state.set ('alpha', action.data);
    default:
      return state;
  }
};

//Provider 组件
export const Data = props => {
  //useReducer 的第二个参数中传入初始值
  const [data, dispatch] = useReducer (reducer, fromJS ({
    category: '',
    alpha: ''
  }));
  return (
    <CategoryDataContext.Provider value={{data, dispatch}}>
      {props.children}
    </CategoryDataContext.Provider>
  )
}
```
然后，在`App.js`中用`Data`这个`Provider`组件来包裹下面的子组件:
```javascript
// App.js
// 增加引入代码
import { Data } from './application/Singers/data';

function App () {
  return (
    <Provider store={store}>
      <HashRouter>
        <GlobalStyle></GlobalStyle>
        <IconStyle></IconStyle>
        <Data>
          { renderRoutes (routes) }
        </Data>
      </HashRouter>
    </Provider>
  )
}
```

然后在`Singers/index.js`来运用：
```javascript
// 首先需要引入 useContext
// 将之前的 useState 代码删除
  const { data, dispatch  } = useContext(CategoryDataContext)
  const { singertype, singerarea, singeralpha } = data.toJS()
```
而且`handleUpdatexxx`函数也要修改:
```javascript
  // 选择了字母的处理函数
  let handleUpdateAlpha = useCallback((val) => {
    dispatch({type: CHANGE_ALPHA, data: val})
    updateDispatch(singertype, singerarea, val);
    // eslint-disable-next-line
  },[dispatch]);

  // 选择了地区的处理函数
  let handleUpdateSingerArea = useCallback((val) => {
    dispatch({type: CHANGE_AREA, data: val})
    updateDispatch(singertype, val, singeralpha);
    // eslint-disable-next-line
  }, [dispatch]);

  // 选择了歌手类型的处理函数
  let handleUpdateSingerType = useCallback((val) => {
    dispatch({type: CHANGE_TYPE, data: val})
    updateDispatch(val,singerarea, singeralpha);
    // eslint-disable-next-line
  }, [dispatch])
```
至此，一个比较简单的`redux`就用`hooks`实现完成了。

看到这里，你可能会说，`hooks`现在不就可以取代`redux`吗？

现在的确也有不少人这样说，尽管`hooks`能模拟`redux`的核心功能，但是能够取代`redux`这件事我不敢苟同。

+ 首先`redux`有非常成熟的状态跟踪调试工具，也就是`chrome`浏览器的`redux-devtools`插件，至少到现在为止开发中很多的错误我都是通过它发现的。换而言之，它能够协助我们写出更利于维护的代码，并且在出现故障时快速找到问题的根源。

+ 其次，`redux`有非常成熟的数据模块化方案，不同模块的`reducer`直接导出，在全局的`store`中，调一下`redux`自带的`combineReducer`即可，目前从官方的角度看`hooks`这方面并不成熟。

+ `Redux`拥有成熟且强大的中间件功能，如`redux-logger`, `redux-thunk`, `redux-saga`，用`hooks`实现中间件的功能就只能靠自己手动实现了。

当然`redux`也并不是十全十美的，有些方面也经常被人吐槽，比如繁重的模板代码，需要`react-redux`引入徒增项目包大小等等。但是瑕不掩瑜，这些不妨碍我们使用`redux`开发出容易调试并维护的应用。

因此客观来说，`redux`是一个短时间不可被替代的状态管理方案。

## 歌手列表页的数据缓存
有了分类名称的缓存，我们再来做歌手列表页的数据缓存就轻松多了。
```javascript
//useEffect 中增加判断逻辑
useEffect (() => {
  if (!singerList.size) {
    getHotSingerDispatch ();
  }
}, []);
```
当歌手列表不为空时，就不发 Ajax 请求，同时能够记忆之前的分类，让分类和列表对应，正是我们想要的效果。