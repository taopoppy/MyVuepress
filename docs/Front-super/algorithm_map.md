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