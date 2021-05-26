# 队列

## 概述
<font color=#DD1144>队列就是一个先进先出的数据结构</font>

结构就和我们平时排队一样，谁先到谁先买东西设计到的两个方法：
+ <font color=#1E90FF>enqueue</font>：入队
+ <font color=#1E90FF>dequeue</font>：出队

涉及到的结构关键词：
+ <font color=#1E90FF>front</font>：队头
+ <font color=#1E90FF>back</font>：队尾

在`javascript`当中，也没有队列这个变量，但是可以使用`Array`实现队列的所有功能，我们现在来实现一下：
```javascript
// 创建一个队列
const queue = []

// 入队
queue.push(1)
queue.push(2)

// 出队
const item1 = queue.shift() // 1
const item2 = queue.shift() // 2
```
可以看到，使用数组来模拟队列这个数据结构也是比较简单的，入队就是向数组的尾端添加元素，出队就是将数组的第一个元素移除即可

<img :src="$withBase('/react_algorithm_2.png')" alt="">

## 使用场景
+ <font color=#1E90FF>所有先进先出的场景</font>
+ 比如：食堂排队打饭，JS异步中的任务队列，计算最近请求次数

## LeetCode示例
我们到`LeetCode`找到题号为933的有效括号这个题目，我们的解题思路如下：
+ <font color=#1E90FF>越早发出的请求越早不在最近3000ms内的请求里</font>
+ <font color=#1E90FF>满足先进先出，使用队列</font>
```javascript
var RecentCounter = function() {
    this.q = []
};

/** 
 * @param {number} t
 * @return {number}
 */
RecentCounter.prototype.ping = function(t) {
    this.q.push(t)
    while(this.q[0] < t-3000) {
        this.q.shift()
    }
    return this.q.length
};

/**
 * Your RecentCounter object will be instantiated and called as such:
 * var obj = new RecentCounter()
 * var param_1 = obj.ping(t)
 */
```

+ <font color=#9400D3>时间复杂度分析</font>：只有一个`while`循环，里面的程序也都是`O(1)`的复杂度，所以时间复杂度就是`O(n)`，这里的`n`就是被出队的元素个数，或者说是`ping`的次数
+ <font color=#9400D3>空间复杂度分析</font>：在极端的情况下，一个都踢不出去，那么内存单元和队列长度是一样的，所以也是`O(n)`


## 前端和队列
在事件循环当中，异步任务会被扔到事件队列当中，事件的执行也是按照队列当中的先进先出的顺序进行执行