# 链表

## 概述
+ <font color=#1E90FF>链表是一种多个元素组成的列表</font>
+ <font color=#1E90FF>元素存储不连续，用next指针链在一起</font>

<img :src="$withBase('/react_algorithm_3.png')" alt="">

看到这里你可能会疑惑，计算都是多个元素连续的列表，为什么不直接使用数组？
+ <font color=#1E90FF>数组增删非首位元素的时候往往需要移动元素</font>
+ <font color=#1E90FF>链表删除非首位元素不需要移动元素，只需要修改next指针的指向即可</font>

在`javascript`当中也是没有链表这个结构的，但是可以通过`Object`去模拟：
```javascript
const a = {val: 'a'}
const b = {val: 'b'}
const c = {val: 'c'}
const d = {val: 'd'}
a.next = b
b.next = c
c.next = d

// 遍历链表
let p = a
while(p) {
	console.log(p.val)
	p = p.next
}

// 插入(修改插入前后两个节点的指针指向)
const e = { val: 'e'}
c.next = e
e.next = d

// 删除(修改插入前后两个节点的指针指向)
c.next = d
```

## LeetCode示例
### 1. 删除链表中的节点
搜索`LeetCode`当中题号为237的题目，删除链表中的节点，这个题比较整蛊，因为它只给了要删除的节点，我们链表删除元素，都是要知道前后的元素，然后前后元素一连接就行了，现在只知道被删除的元素怎么办？
+ <font color=#1E90FF>将被删除的元素的下个元素赋值给被删除的元素</font>
+ <font color=#1E90FF>删除被删除元素的下个元素</font>

简单的说[4,1,5,9]我们只知道5，怎么办，将5变成9，再把9删除，即[4,1,5,9] => [4,1,9,9] => [4,1,9]
```javascript
// Definition for singly-linked list.
// function ListNode(val) {
//     this.val = val;
//     this.next = null;
// }

/**
 * @param {ListNode} node
 * @return {void} Do not return anything, modify node in-place instead.
 */
var deleteNode = function(node) {
    node.val = node.next.val
    node.next = node.next.next
};
```
这个算法的空间复杂度和时间复杂度都是`O(1)`，因为都只有一步操作而已。

### 2. 翻转链表
搜索`LeetCode`当中题号为206的题目，翻转链表，给出头结点，返回翻转后的整个链表：
首先说明一下我自己的思路，如果只给出一个头结点，然后遍历整个链表进行翻转，肯定要用到额外的变量来记录，翻转无非就是将后面的节点的next指向前面，所以每一次遍历都至少要知道三个东西
+ 前一个节点
+ `head`头节点
+ 后一个节点
```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    if(!head) {
        return null
    }
    let pre = null  // 定义第一轮的pre初始值
    let next = head.next // 定义第一轮next的初始值
    while(head) {
        head.next = pre  // 做修改
        pre = head       // 定义下一轮的pre
        head = next      // 定义下一轮的head
        if(head) {
					next = next.next // 定义下一轮的next
				}
    }
    return pre 
};
```
<img :src="$withBase('/react_algorithm_4.png')" alt="">

所以从上面的图示和代码来看，类似这种循环遍历的算法题，是有经验可循的，比如循环遍历的顺序大概就是：<font color=#1E90FF>定义初始值</font> -> <font color=#1E90FF>操作</font> -> <font color=#1E90FF>定义下一轮的初始值</font>（一般如果下一轮的初始值和上一轮值有关，就要放在循环当中去定义了）

所以其实上面的代码我们还可以优化: 
+ <font color=#9400D3>初始值如果需要自己定义，就要定义到循环外面，如果一些初始值是另一些初始值的衍生，比如说next是head的衍生，因为next是可以根据head计算出来的，就可以放在循环里面</font>
+ <font color=#9400D3>搞清楚返回值，因为返回值要根据下一轮的值来进行返回，所以可以看到我们最后返回的pre，而不是head</font>
```javascript
var reverseList = function(head) {
    let pre = null  // 自定义初始值
    let tempHead = head // 自定义初始值
    while(tempHead) {
        let next = tempHead.next  // 衍生初始值
        tempHead.next = pre       // 操作
        pre = tempHead            // 定义下一轮变量
        tempHead = next           // 定义下一轮变量
    }
    return pre // 返回值要根据下一轮返回值合理返回
};
```
+ <font color=#1E90FF>时间复杂度</font>：只有一个循环，所有时间复杂度为`O(n)`,可见N就是链表的长度
+ <font color=#1E90FF>空间复杂度</font>：无论多长的链表，我们的临时变量就只有3个，所以实际上空间复杂度是个定值，为`O(1)`



### 3. 求两个数的和
搜索`LeetCode`当中题号为2的题目,求两个数的和，我的思路是这样，首先要考虑要记录的元素：
+ 因为两个数相加可能会超过10，向前进一位，所以记录一下进位数
+ 因为每个相加后的节点需要作为链表的节点加入链表，所以需要记录前一个链表的节点
+ 又因为最后访问结果要访问链表，所以要记录头节点

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    // 设置一个进位数
    let nextTop = 0
    // 设置上一个节点
    let preNode = ''
    // 设置头节点
    let header = new ListNode((l1.val + l2.val)%10,null)
    while((l1 || l2) || (nextTop!==0)) {
        let data = ((l1 &&l1.val) || 0) + ((l2 && l2.val) || 0) + nextTop
        nextTop = Math.floor(data/10)
        let tempNode = new ListNode((data%10), null) // 相加操作
        if(preNode!=='') {
            if(!header.next) {
                header.next = tempNode   // 特殊节点（头节点）连接链表操作
            } else {
                preNode.next = tempNode  // 普通节点连接链表操作
            }
            preNode = tempNode  // 定义下一轮的preNode
        } else {
            preNode = tempNode // 定义下一轮的preNode
        }
        l1 = (l1 && l1.next) || null // 定义下一轮的l1
        l2 = (l2 && l2.next) || null // 定义下一轮的l2
    }
    return header
};
```
当然这种思路是对的，但是对于代码优化来说，需要注意的点就是：<font color=#9400D3>特殊判断单例化</font>，什么意思呢，就是说在上述代码代码当中：
+ <font color=#1E90FF>while判断条件不应该加特殊条件nextTop!==0， 因为特殊只会出现一次，所以如果每次都要判断，就会消耗时间，所以这种特殊情况直接拉出来单独书写</font>
+ <font color=#1E90FF>尽量在操作的时候不要加入太多的判断，这种判断在每次的循环当中都要执行，消耗性能，比如上述代码header和preNode，既然preNode在第一轮循环不存在，我们可以不可以制造一个已经存在的preNode，这样可以统一代码</font>

经过优化的代码如下：
```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    const l3 = new ListNode(0)  // 定义一个虚假的preNode
    let p1 = l1
    let p2 = l2
    let p3 = l3
    let carry = 0
    while(p1 || p2) {
        const v1  = p1? p1.val : 0
        const v2  = p2? p2.val : 0
        const val = v1 + v2 + carry
        carry = Math.floor(val / 10);
        p3.next = new ListNode(val % 10)  // 这里就统一化了，不需要判断什么headNode和preNode
        if(p1) p1 = p1.next
        if(p2) p2 = p2.next
        p3 = p3.next
    }
    // 把特殊情况拿出来单独写，尽量不要书写在循环当中
    if(carry) {
        p3.next = new ListNode(carry)
    }
    return l3.next
};
```
+ <font color=#1E90FF>时间复杂度</font>：`O(n)`，`n`就是较长链表的长度
+ <font color=#1E90FF>空间复杂度</font>：因为存在一个新的链表，且长度和较长的链表长度一致或者更长，所以空间复杂度为`O(n)`，<font color=#DD1144>但是新的链表是作为一个返回值存在的，所以实际上返回值不算空间复杂度的话算法空间复杂度就是O(1)</font>

### 4. 删除链表中重复的数据
搜索`LeetCode`当中题号为83的题目，给定`head`，然后删除链表中重复的元素

这道题我的思路是这样：根据前面两个题总结的经验，这个题就很简单了，我们要按照下面的思路去想：
+ <font color=#1E90FF>首先从大的方面我们知道这肯定是要遍历和循环的，然后我们先思考每次循环做的事情，两个节点对比，一样就将前一个节点的next指向后一个节点的next</font>
+ <font color=#1E90FF>怎么定义初始变量？变量要根据每一轮循环里的操作变量来定义的，比如上述的操作设计到两个节点对比，那必然要定义两个变量</font>
+ <font color=#1E90FF>如何操作？这个需要随机应变，属于算法本身的内容</font>
+ <font color=#1E90FF>定义下一轮变量，下一轮变量就是修改初始变量的值，随机应变，属于算法本身的内容</font>
+ <font color=#1E90FF>返回head，这个我们只需要一开始定义一个新节点记住head即可</font>
```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var deleteDuplicates = function(head) {
    let tempNode = new ListNode(0, head)
    let p1 = head
    let p2 = head && head.next || null
    while(p2) {
        let p3 = p2.next
        if(p1.val === p2.val) {
            p1.next = p3
            p2 = p3
        } else {
            p1 = p2
            p2 = p3
        }
    }
    return tempNode.next
};
```
+ <font color=#1E90FF>时间复杂度</font>：只有一个循环，所有时间复杂度为`O(n)`,可见N就是链表的长度
+ <font color=#1E90FF>空间复杂度</font>：为`O(1)`

### 5 环形链表
搜索`LeetCode`当中题号为83的题目，给定`head`，然后删除链表中重复的元素

<font color=#DD1144>这道题就有意思了，如果你按照一般思想是想不出来结果的，我们的思维就是制造一个快指针和慢指针，然后一直遍历直到两者相同，这个原理就是如果在一个圈里跑，虽然起点一样，但是迟早快的要比慢的快一圈，也就是套圈模式</font>

放在这个题当中，如果存在套圈，那么不会存在指针为`null`的情况，所以如果有哪个节点的`next`为`null`，说明不存在套圈，但是这个条件不能作为判断的唯一依据，因为题目只给了`head`一个参数，而如果两个快慢指针重合了，说明有套圈
```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function(head) {
    let p1 = head
    let p2 = head
    while(p1 && p2 && p2.next) { // 这里的条件是每次循环都要判断的，所以不属于特殊铁条件
        p1 = p1.next
        p2 = p2.next.next
        if(p1 === p2) return true

    }
    return false
};
```
所以其实写法很简单，而且：
+ <font color=#1E90FF>时间复杂度</font>：`O(n)`，无论是`O(2n)`还是`O(3n)`，都属于`O(n)`，因为没有脱离级别
+ <font color=#1E90FF>空间复杂度</font>：`O(1)`

## 前端和链表
前端的<font color=#9400D3>原型链就是一个本质为类的数据结构</font>

关于原型链我们可以仔细去学习一下，但是下面这几个关键的知识点要牢记：
+ <font color=#DD1144>如果A沿着原型链可以找到B.prototype,那么instanceof B为true</font>
+ <font color=#DD1144>如果在A对象上没有找到X属性，就会沿着原型链找X属性</font>

相关的有两个面试题：

<font color=#1E90FF>**① instanceof原理，并用代码实现**</font>

解法：<font color=#DD1144>遍历A的原型链，如果能找到B.prototype，返回true，否则返回false</font>
```javascript
const  instanceof = (A, B) => {
    let p = A
    while(p) {
        if(p === B.prototype) {
            return true
        }
        p = p.__proto__
    }
    return false
}
```
