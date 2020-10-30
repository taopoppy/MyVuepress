# 自定义Hook

## 含义和作用
目前为止，在`React`中有两种流行的方式来共享组件之间的状态逻辑: `render props`和`高阶组件`，现在让我们来看看<font color=#DD1144>自定义Hook是如何通过将组件逻辑提取到可重用的函数的方式来解决共享组件之间状态逻辑的问题的</font>。


## 提取自定义Hook
<font color=#1E90FF>自定义Hook是一个函数，其名称以 “use” 开头，函数内部可以调用其他的Hook。但要确保只在自定义 Hook 的顶层无条件地调用其他 Hook</font>

我们先来看看原本的实例：
```javascript
import React, { useState, useEffect } from "react";

function Eleone(props) {
  const [isSuccess, setIsSuccess] = useState(0);

  useEffect(() => {
    if (props.id % 2 === 0) {
      setIsSuccess(1);
    } else {
      setIsSuccess(0);
    }
  }, [props.id]);

  return (
    <>
      <div
        style={{
          background: isSuccess === 1 ? "green" : "red",
          width: "300px",
          height: "300px"
        }}
      />
    </>
  );
}

function Eletwo(props) {
  const [isSuccess, setIsSuccess] = useState(0);

  useEffect(() => {
    if (props.id % 2 === 0) {
      setIsSuccess(1);
    } else {
      setIsSuccess(0);
    }
  }, [props.id]);

  return (
    <>
      <span> {isSuccess === 1 ? "成功" : "失败"}</span>
    </>
  );
}

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Eletwo id={count} />
      <Eleone id={count} />
    </div>
  );
}
export default App;
```
我们把`Eletwo`和`Eleone`中的相同的逻辑进行提取：
```javascript
function useGetSuccess(id) {
  const [isSuccess, setIsSuccess] = useState(0);

  useEffect(() => {
    if (id % 2 === 0) {
      setIsSuccess(1);
    } else {
      setIsSuccess(0);
    }
  }, [id]);

  return isSuccess;
}
```

## 使用自定义 Hook
```javascript
function Eleone(props) {
  const isSuccess = useGetSuccess(props.id); // 使用

  return (
    <>
      <div
        style={{
          background: isSuccess === 1 ? "green" : "red",
          width: "300px",
          height: "300px"
        }}
      />
    </>
  );
}

function Eletwo(props) {
  const isSuccess = useGetSuccess(props.id); // 使用

  return (
    <>
      <span> {isSuccess === 1 ? "成功" : "失败"}</span>
    </>
  );
}
```


使用自定义`Hook`我们有两个特别要注意的点:

<font color=#1E90FF>**① 在两个组件中使用相同的Hook会共享state吗**</font>

官网给出的答案是：`不会。自定义Hook是一种重用状态逻辑的机制(例如设置为订阅并存储当前值)，所以每次使用自定义Hook时，其中的所有state和副作用都是完全隔离的。`

而我的理解是，<font color=#9400D3>在这里有两个容易理解错的概念，共享状态逻辑和共享状态，这两个是完全不同的概念，共享状态逻辑强调的是逻辑，两个不同的组件中分别有状态A和B，大家都做自增或者自减的操作，这叫做逻辑相同，叫做状态逻辑相同。而两个不同的组件中使用的状态是同一个，一个组件中对状态的修改一定会影响到另一个组件，这叫做状态相同</font>

<font color=#1E90FF>**② 到底什么是共享逻辑状态**</font>

通过我们上面举的例子也可以看出来：<font color=#DD1144>共享逻辑状态就是，不同的组件面对同一状态的改变之后所要执行的逻辑是完全相同的</font>，就好比上面的`Eleone`和`Eletwo`组件面对父组件传来的`id`这个状态发生变化的时候，`Eleone`和`Eletwo`组件内部都要对`id`做除余的处理逻辑，这种面对相同状态变化执行的统一逻辑就可以单独拿出来做成一个自定义`Hook`，这就是共享逻辑状态。

<font color=#DD1144>希望你在学习完自定义HOOK之后回头思考一下为什么在Hook没有出现之前，组件之间复用状态逻辑会很难</font>