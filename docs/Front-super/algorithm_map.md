# 字典

## 概述
+ <font color=#DD1144>与集合类似，字典也是一种存储唯一值的数据结构，但是它是以<font color=#9400D3>键值对</font>的形式来存储	</font>

+ 最重点的就是<font color=#9400D3>键值对</font>，因为这样可以在键值之间做映射关系，在`Es6`当中是有`Map`这个数据结构的，虽然`Map`不是字典的意思，但却是键值的意思，很能凸显字典的特性

+ 字典的常用操作：键值对的增删改查

```javascript
const  mp = new Map();

// 增(map.set(key，value))
mp.set('a','aa')
mp.set('b','bb')

// 删(map.delete(key))
mp.delete('b')
mp.clear() // 清空

// 改/覆盖(map.set(key, value))
mp.set('a','aaa')

// 查(map.get(key))
mp.get('b') // undefined
```

## LeetCoode示例
### 1. 数组的交集
在`leetCode`当中找到349,两个数组的交集，我们现在使用`map`来解决它

我们的解决思路就是，将其中一个数组变成字典，然后通过循环第二个数组，如果和字典有重复的，我们就记录，然后从字典当中删除该字典元素
```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersection = function(nums1, nums2) {
    let map = new Map()
    nums1.forEach(item => {
        map.set(item, true)
    })

    let result = []
    nums2.forEach(item => {
        if(map.has(item)){
            map.delete(item)
            result.push(item)
        }
    })

    return result
};
```
+ <font color=#9400D3>时间复杂度</font>：两个数组的长度分别是`m`和`n`，所以时间复杂度是`O(m+n)`
+ <font color=#9400D3>空间复杂度</font>：其中只有一个字典，字典也有可能是线性增长的，所以在最坏的情况下应该是`O(m)`

### 2.有效的括号
在`leetCode`当中找到20,有效括号，我们现在使用`map`来优化它，我们现在展示一下优化前后的代码：
```javascript
// 优化前
var isValid = function(s) {
    if(s.length % 2 !== 0 ) return false 
    // 申明一个栈
    const stack = []
    for(let i = 0; i<s.length; i++) {
        const c = s[i]
        if(c === "(" || c==="{" || c === "[") {
            stack.push(c)
        } else {
            const t = stack[stack.length - 1]
            if(
                (t === "(" && c === ")") ||
                (t === "{" && c === "}") ||
                (t === "[" && c === "]")
            ){
                stack.pop()
            } else {
                return false
            }
        }
    }
    return stack.length === 0
};

// 优化后
var isValid = function(s) {
    if(s.length % 2 !== 0 ) return false 
    // 申明一个栈
    const stack = []
    const map = new Map([
        ["(",")"],
        ["{","}"],
        ["[","]"]
    ])

    for(let i = 0; i<s.length; i++) {
        const c = s[i]
        if(map.has(c)) {  // 优化条件
            stack.push(c)
        } else {
            const t = stack[stack.length - 1]
            if(c === map.get(t)){ // 优化条件
                stack.pop()
            } else {
                return false
            }
        }
    }
    return stack.length === 0
};
```
时间和空间复杂度都没有变，但是为什么这样的优化能更快，就是因为原来的多个判断条件直接变成了字典映射，所以如果条件更多，这样的优化的效果也会更加显著

### 3.两数之和
在`leetCode`上找到1这个题，两数之和，这个题我们最能想到的就是两个循环
```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    for(let i =0; i< nums.length-1; i++) {
        let one = nums[i]
        for(let j = i+1; j < nums.length; j++) {
            let two = nums[j]
            if(one + two === target) {
                return [i, j]
            }
        }
    }
};
```
这种写法首先是两个循环嵌套，所以时间复杂度为`O(n) * O(n-1)`，就是`O(n(n-1))`,这种是在最恶劣的情况下的时间复杂度，空间复杂度为`O(1)`

但是我们这里使用字典来写算法，我们的解法是：<font color=#DD1144>循环一次数组，每次针对元素做操作，如果有和他配对的元素在字典当中，就直接返回字典那个值的下标和当前元素的下标，如果没有，将此元素的值和下标作为字典的key和value进行保存</font>

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let map = new Map()
    for(let i=0; i< nums.length; i++) {
        let self = nums[i]
        let temp = target-self
        if(map.has(temp)) {
            return [map.get(temp), i]
        } else {
            map.set(self,i)
        }
    }
};
```
+ <font color=#9400D3>时间复杂度</font>：`O(n)`
+ <font color=#9400D3>空间复杂度</font>：`O(n)`,空间复杂度是由于存在新建的`map`，<font color=#DD1144>但是我们后面还会使用二分查找来使用牺牲时间换取空间的高级算法</font>