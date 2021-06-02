# 集合

## 概述
<font color=#DD1144>集合是一种无序切唯一的数据结构</font>，在前端`es6`当中，有集合`set`这个数据结构，所以我们可以直接使用它去帮助我们学习和解决关于集合的问题。

集合的常用操作：
+ <font color=#1E90FF>去重</font>
  ```javascript
  const arr = [1,1,2,2]
  const arr2 = [...new Set(arr)]
  ```
+ <font color=#1E90FF>判断某个元素是否在集合当中</font>
  ```javascript
  const set = new Set(arr)
  const has = set.has(3) // 使用Set的has方法可以直接判断元素是否在集合当中
  ```

+ <font color=#1E90FF>求交集和差集</font>
  ```javascript
  const set1 = new Set([2,3])
  const set2 = new Set([1,2])

  // 求交集
  const set3 = new Set([...set1].filter(item => set2.has(item)))
  // 求差集
  const set4 = new Set([...set1].filter(item => !set2.has(item)))
  ```
  这个特别要注意，<font color=#DD1144>集合和数组之间的转换，数组 = [...集合]， 集合 = new Set(数组)</font>，


## LeetCode示例
### 1. 两个数组的交集
在`LeetCode`上找到349这个题，这个题和我们前面说的基本上解法是一样的，就是至少是将一个数组变成集合去重，然后过滤：
```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersection = function(nums1, nums2) {
    const set1 = new Set(nums1)
    const set2 = new Set(nums2)
    const set3 = [...set1].filter(item => set2.has(item))
    return set3
};
```
+ <font color=#9400D3>时间复杂度</font>：时间复杂度，不能广义的说成`O(n^2)`，因为并不知道集合的长度，准确的说应该是`O(mn)`，`m`和`n`分别是两个集合的长度
+ <font color=#9400D3>空间复杂度</font>：空间复杂度是`O(n)`，准确的说是`O(m+n)`，因为额外的存储了`set1`和`set2`，因为`set3`是返回值，不作为空间复杂度的计算。

## 前端与集合
前端`ES6`当中有集合这个数据结构`Set`，我们要学习一下如何使用`Set`对象的方法和属性，同时还有如何迭代`Set`，`Set`与`Array`互转，求交集和差集

### 1. Set对象
<font color=#1E90FF>**① add方法**</font>

```javascript
let MySet = new Set()

mySet.add(1) // 添加成功
mySet.add(4) // 添加成功
mySet.add(4) // 添加失败，因为mySet已经有了4

mySet.add({name:"taopoppy"}) // 添加成功
mySet.add({name:"taopoppy"}) // 添加成功(这里能添加成功是因为是字面量对象，每个新的字面量对象都是一个新的内存)

let b = {sex: "man"}
mySet.add(b) // 添加成功
mySet.add(b) // 添加失败(这里失败，因为b指向的是同一块内存)
```

<font color=#1E90FF>**② has方法**</font>

```javascript
let mySet = new Set([1,2,3])

mySet.has(1) // true
mySet.has(3) // true

let b = {name: "taopoppy"}
mySet.add(b)
mySet.has(b) //true
mySet.has({name: "taopoppy"}) // false, 字面量对象和b并不属于同一块内存
```

<font color=#1E90FF>**③ delete方法 && size**</font>

`set.delete()`方法就是删除一个元素，在成功调用`has`或者`delelte`方法后，`size`属性也会跟随变化，`size`表示集合的尺寸

### 2. 迭代和转换
<font color=#1E90FF>**① for of**</font>

```javascript
// 直接迭代集合
for(let item of myset) {
  console.log(item)
}

// 迭代keys或者values，因为key和value相同
for(let item of myset.keys()) {
  console.log(item)
}
```

<font color=#1E90FF>**② 转换**</font>

```javascript
// 集合转数组
const myArr = [...mySet]
const myArr = Array.from(mySet)

// 数组转集合
const mySet = new Set(myArr)

```


