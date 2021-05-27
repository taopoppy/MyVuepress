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