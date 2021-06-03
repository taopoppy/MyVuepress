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

### 4. 无重复字符的最长字串
在`leetCode`上找到3这个题，无重复字符的最长字串

当然了我们首先要讲最能想到的暴力解法，就是从字符串的第一个字符依次向后检查，如果包含重复的字串，我们就开始从第二个字符开始，所以代码如下：
```javascript
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
	let map = new Map()
	let maxLength = 0
	for(let i = 0; i< s.length; i++) {
        let self = s[i] === " "? -1: s[i]
        map.set(self)
        for(let j = i + 1; j< s.length; j++) {
            let next =  s[j] === " "? -1: s[j]
            if(map.has(next)) {
                break
            }else {
                map.set(next)
            }
        }
		maxLength = Math.max(maxLength, map.size)
        map.clear()
	}
	return maxLength
};
```
+ <font color=#9400D3>时间复杂度</font>：`O(n(n-1))`，`n`就是字符串的长度
+ <font color=#9400D3>空间复杂度</font>：`O(n)`，`n`为字符串的最大字串的长度

我们这道题有更奇妙的算法，就是两个指针定义的<font color=#DD1144>滑动窗口</font>，我们举个例子：比如`abac`,一开始两个指针都指向`a`，尾指针开始向后遍历，每次遍历到新的字符就存入字典，如果遇到重复的话，比如尾指针指向第二个a的时候，因为`aba`有两个`a`，所以头指针向前进一位，依次类推，每次记录一下两个指针之间的长度，选出最大的即可

```javascript
var lengthOfLongestSubstring = function(s) {
	var map = new Map()
	var maxLength = 0
    // 记录两个指针
    var start = 0
    var end = 0
    while(end < s.length) {
		let key = s[end] === " "? -1: s[end] // 特殊情况1
        if(map.has(key)) {
            start = Math.max(map.get(key)+1, start) // 特殊情况2
        }
        map.set(key, end)
        maxLength = Math.max(maxLength, end-start+1)
        end++
    }

	return maxLength
};
```
其中有两个特殊的情况
+ 第一个就是空格字符串没有办法存到字典当中，我们将空格字符串记录为-1
+ 第二个特殊情况就是：`abcdba`这个字符串在尾指针在指向倒数第二位的时候发现`b`有重复，所以头指针就指向了第一个`b`,但是尾指针指向最后一位的时候，发现`a`重复，但是这个时候头指针已经在第一个`a`的后面了，不能再回到第一个`a`，所以头指针始终为当前头指针和重复字符下标的最大值

+ <font color=#9400D3>时间复杂度</font>: `O(n)`
+ <font color=#9400D3>空间复杂度</font>：`O(m)`，<font color=#1E90FF>注意，这里的m指的是整个字符串不重复字符的个数</font>