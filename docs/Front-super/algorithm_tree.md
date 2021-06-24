# 树

## 概述
<font color=#9400D3>树是一种<font color=#DD1144>分层</font>数据的抽象模型</font>

`Js`当中是没有树这个数据结构但是我们可以通过`Object`和`Array`构建树。

树结构的常用操作：
+ <font color=#1E90FF>深度/广度优先遍历</font>
+ <font color=#1E90FF>先中后序遍历</font>

## 广度/深度优先遍历
### 1. 深度优先遍历
<font color=#9400D3>深度优先遍历</font>：尽可能深的搜索树的分支，算法只有两个步骤
+ <font color=#DD1144>访问根节点</font>
+ <font color=#DD1144>对根节点的children挨个进行深度优先遍历</font>

我们来书写一下：
```javascript
const tree = {
	value: 'a',
	children: [
		{
			value: 'b',
			children: [
				{ value: 'd', children: [] },
				{ value: 'e', children: [] }
			]
		},
		{
			value: 'c',
			children: [
				{ value: 'f', children: [] },
				{ value: 'g', children: [] }
			]
		}
	]
}

// 深度优先遍历
const dfs = (tree) =>  {
	console.log(tree.value)
	tree.children.forEach(dfs);
}

dfs(tree)
```

### 2. 广度优先遍历
<font color=#9400D3>广度优先遍历</font>：先访问离根节点最近的节点，步骤如下
+ <font color=#DD1144>新建一个队列，把根节点入队</font>
+ <font color=#DD1144>把队头出队并访问</font>
+ <font color=#DD1144>把队头的children挨个入队</font>
+ <font color=#DD1144>重复2,3步骤，知道队列为空</font>

```javascript
const tree = {
	value: 'a',
	children: [
		{
			value: 'b',
			children: [
				{ value: 'd', children: [] },
				{ value: 'e', children: [] }
			]
		},
		{
			value: 'c',
			children: [
				{ value: 'f', children: [] },
				{ value: 'g', children: [] }
			]
		}
	]
}

// 广度优先遍历
const bfs = () => {
	let queue = [tree]
	while(queue.length) {
		let item = queue.shift()
		console.log(item.value)
		item.children.forEach(child => {
			queue.push(child)
		})
	}
}

bfs(tree)
```

## 二叉树先后中序遍历(递归版本)
二叉树的特点是树中每个节点最多只能有两个子节点，在`JS`当中我们通常使用`Object`来模拟二叉树，因为最多只有两个子节点，所以树的子节点我们不用数组来表示，直接使用`left`和`right`来表示


+ 先序遍历
	+ <font color=#1E90FF>访问根节点</font>
	+ <font color=#1E90FF>对根节点的左子树进行先序遍历</font>
	+ <font color=#1E90FF>对根节点的右子树进行先序遍历</font>


+ 中序遍历
	+ <font color=#1E90FF>对根节点的左子树进行中序遍历</font>
	+ <font color=#1E90FF>访问根节点</font>
	+ <font color=#1E90FF>对根节点的右子树进行中序遍历</font>

+ 后序遍历
	+ <font color=#1E90FF>对根节点的左子树进行后序遍历</font>
	+ <font color=#1E90FF>对根节点的右子树进行后序遍历</font>
	+ <font color=#1E90FF>访问根节点</font>

```javascript
const tree = {
	value: 1,
	left: {
		value: 2,
		left: { value: 4, left: null, right: null },
		right: { value: 5, left: null, right: null },
	},
	right: {
		value: 3,
		left: { value: 6, left: null, right: null },
		right: { value: 7, left: null, right: null },
	},
}

// 先序遍历
const preorder = (tree) => {
	if(!tree) return
	console.log(tree.value)
	preorder(tree.left)
	preorder(tree.right)
}

// 中序遍历
const inorder = (tree) => {
	if(!tree) return
	inorder(tree.left)
	console.log(tree.value)
	inorder(tree.right)
}

// 后序遍历
const postorder = (tree) => {
	if(!tree) return
	postorder(tree.left)
	postorder(tree.right)
	console.log(tree.value)
}

preorder(tree) // 1245367
inorder(tree) // 4251637
postorder(tree) // 4526731
```

## 二叉树先后中序遍历(非递归版)
### 1. 先序遍历
非递归版的先序遍历我们需要先画一个图来告诉大家怎么做：

<img :src="$withBase('/react_algorithm_5.png')" alt="">

+ 我们自己创建了一个栈，然后先把初始节点1放了进去
+ 从栈中拿到1，发现存在左右节点2和3,<font color=#1E90FF>先把有右节点3压入栈，然后把2压入栈，因为栈是个现进后出的结构</font>
+ 然后从栈中拿出2，发现存在左右节点4和5，把5和4先后压入栈
+ 然后从栈中拿出5，发现5没有左右节点，此时栈还不为空，继续
+ 然后从栈中拿出4，发现4也没有左右节点，此时栈依旧不为空，继续
+ 然后从栈中拿出3，发现存在左右节点6和7，把7和6先后压入栈
+ 然后从栈中拿出6，发现6没有左右节点，此时栈还不为空，继续
+ 然后从栈中拿出7，发现7也没有左右节点，此时栈为空，结束

```javascript
// 先序遍历
const preorder = (tree) => {
	if(!tree) return
	let stack = [tree]
	while(stack.length!==0) {
		let node = stack.pop()
		console.log(node.value)
		if(node.right) stack.push(node.right)
		if(node.left) stack.push(node.left)
	}
}
```

### 2. 中序遍历
先说一下我自己想出来的一个方法，按照上面先序的启示，我们依旧可以使用栈作为数据结构，先画一个图

<img :src="$withBase('/react_algorithm_6.png')" alt="">

+ 我们自己创建了一个栈，然后先把初始节点1放了进去
+ 从栈中取出1，发现存在左右节点2和3，<font color=#1E90FF>将3,1,2的顺序依次压入栈，注意的是压入1的时候需要给1做个标记，证明它已经被拆分过</font>
+ 然后取出2，发现存在左右节点4和5,然后按照5,2(mark),4的顺序压入栈
+ 然后取出4，发现4没有左右节点，所以打印即可
+ 然后取出2，发现它是被标记过的，直接打印即可
+ 然后取出5，发现5没有左右节点，所以打印即可
+ 然后取出1，发现1是被标记过的，直接打印即可
+ 然后取出3，发现有左右节点，按照7,3(mark),6的顺序压入栈即可
+ 然后取出6，发现6没有左右节点，所以打印即可
+ 然后取出3，发现已经被标记，直接打印即可
+ 然后取出7，发现7没有左右节点，所以打印即可

```javascript
const inorder = (tree) => {
	if(!tree) return
	let stack = [tree]
	while(stack.length!==0) {
		let node = stack.pop()
		if(!(node.right && node.left) || node.mark){
			console.log(node.value)
			continue
		}
		if(node.right) stack.push(node.right)
		node.mark = true
		stack.push(node)
		if(node.left) stack.push(node.left)
	}
}
```

还有一种方式，就是中序遍历的特点你仔细研究就会发现，先是沿着左子树会一直找到最下面，然后沿着最下面的一个节点往上找，也就是说，沿着1这个节点，一直沿着左边找到4,4开始往上找到2,2开始沿着5重新再整一轮，那么我们的代码如下：
```javascript
const inorder = (tree) => {
	if(!tree) return
	let stack = []
	let p = tree
	while(stack.length || p){
		while(p){
			stack.push(p)
			p = p.left
		}
		const n = stack.pop()
		console.log(n.value)
		p = n.right
	}
}
```
这个写法是相对来说比较重要且稍微难懂一点，相对于上面我自己那种标记的算法显的更加正规，这是一种指针记录的方式。

### 3. 后序遍历
按照上面中序遍历的启示，我们也有两种写法，就是<font color=#DD1144>标记</font>和<font color=#DD1144>指针的方法</font>，思路和图示我们就不展示了，几乎和中序遍历是一个套路，只不过顺序稍微有点变化而已：
```javascript
// 标记方法
const postorder = (tree) => {
  if(!tree) return
  let stack = [tree]
  while(stack.length!==0) {
    const node = stack.pop()
    if(!(node.right && node.left) || node.mark) {
      console.log(node.value)
      continue
    }
    node.mark = tree
    stack.push(node)
    if(node.right) stack.push(node.right) // 就是顺序有变化而已
    if(node.left) stack.push(node.left)
  }
}
```

还有一个方法如下：<font color=#DD1144>如果你能够仔细观察，后序遍历的顺序你就会发现，整个顺序是一个变异先序的逆序，变异先序就是按照根右左的顺序，逆序就是倒过来</font>，所以只要我们能够按照根右左的顺序去访问节点，在访问的时候将节点压入另一个栈，那么另一个栈的出栈顺序就是后续遍历：

```javascript
const postorder = (tree) => {
	if(!tree) return
	let stack = [tree]
  let stack1 = []
	while(stack.length){
    let node = stack.pop()
    stack1.push(node)
    if(node.left) stack.push(node.left)
    if(node.right) stack.push(node.right)
  }
	while(stack1.length) {
    console.log(stack1.pop().value)
  }
}
```
所以实际上是用到了两个栈的结构，我们把变异先序遍历的访问变成了压入另一个栈的操作而已。


## LeetCode示例
### 1. 二叉树的最大深度
在`leetcode`当中找到104这道题，题目为二叉树的最大深度

思路：二叉树的最大深度和树的有限遍历不谋而合，但是还需要加点逻辑
+ <font color=#1E90FF>新建一个变量，记录最大深度</font>	
+ <font color=#1E90FF>深度优先遍历整个树，并记录每个节点的层级，同时不断刷新最大深度这个变量</font>
+ <font color=#1E90FF>遍历结束后返回这个最大深度即可</font>

我自己根据该思路得出的代码：
```javascript
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function(root) {
   if(!root) return 0
   let maxDeep = 1  // 记录最大深度
   const dfs = (root, floor) => {
       if(!root) return 
       maxDeep = Math.max(maxDeep,floor) // 不断刷新最大深度
       dfs(root.left, floor+1) // 对下一个子节点进行遍历的时候需要深度+1
       dfs(root.right, floor+1)
   }

    dfs(root, maxDeep)
    return maxDeep
};
```

这个写法基本上就是最标准的写法，只不过在时间上还可以稍微优化，因为我们不需要在每个节点都去刷新最大深度，只需要在叶子节点刷新即可，所以我们最标准的写法如下：
```javascript
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function(root) {
   if(!root) return 0
   let maxDeep = 1
   const dfs = (root, floor) => {
       if(!root) {
           return
       } 
       if(!root.left && !root.right) {
           maxDeep = Math.max(maxDeep, floor)
       }
       dfs(root.left, floor+1)
       dfs(root.right, floor+1)
   }

    dfs(root, maxDeep)
    return maxDeep
};
```
+ <font color=#9400D3>时间复杂度</font>：`O(n)`, `n`就是整个树的节点数
+ <font color=#9400D3>空间复杂度</font>：`O(deep)`, 整个过程并非只有`maxDeep`这一个变量，因为`dfs`函数也属于内存，而在函数在递归执行的时候存在函数栈，栈的最大长度实际上就是树的最大深度，而树的最大深度和树的节点数`n`的关系在最坏的情况下就是相等，就是树每层只有一个节点，此时空间复杂度就是`O(n)`，最好的情况就是树每层都是满的，比如三层有7个节点，那么空间复杂度就约等于`O(logN)`

### 2. 二叉树的最小深度
<font color=#1E90FF>**① 深度优先遍历**</font>

二叉树的最小深度和最大深度恰恰是个相反的过程
```javascript
var minDepth = function(root) {
    if(!root) return 0
    let minDeep = +Infinity

    const dfs = (root, floor) => {
        if(!root) return
        if(!root.left && !root.right) {
            minDeep = Math.min(minDeep,floor)
        }

        if(root.left) dfs(root.left, floor+1)
        if(root.right) dfs(root.right, floor+1)
    }
    dfs(root, 1)

    return minDeep
};
```
如果这样做的话，实际上对于最小深度的时间复杂度和空间复杂度和最大深度是一样的，因为要遍历整颗树，只是在叶子节点的比大小的逻辑有所不同，但是最小深度其实可以优化，就是如果我们在递归的时候，发现`floor`已经大于记录的`minDeep`，就可以不用往下进行了，因为再往下也还是大于`minDeep`，没有什么必要，所以我写的代码如下：
```javascript
var minDepth = function(root) {
    if(!root) return 0
    let minDeep = +Infinity
    const dfs = (root, floor) => {
        if(!root || floor > minDeep ) return  // 当floor > minDeep就没有必要继续遍历下面的子节点了
        if(!root.left && !root.right) {
            minDeep = Math.min(minDeep,floor)
        }

        if(root.left) dfs(root.left, floor+1)
        if(root.right) dfs(root.right, floor+1)
    }
    dfs(root, 1)

    return minDeep
};
```
这种写法下时间复杂度和空间复杂度在最差的情况下是和最大深度是一样的，分别是`O(n)`和`O(deep)`


<font color=#1E90FF>**② 广度优先遍历**</font>

其实更简单的方法是广度优先遍历，广度优先遍历为什么更简单呢，因为一层一层的找，只有找到一个叶子节点，就知道最小深度了,所以我的思路是：
+ 广度优先遍历每个节点，记录每个节点的层级
+ 依次取出队列的值，然后判断是否是叶子节点，如果是，就返回对应的层级即可

```javascript
var minDepth = function(root) {
    if(!root) return 0
    let queue = [[root, 1]]

    let minDeep = 1

    while(queue.length) {
        const [node, floor] = queue.shift()
        if(!node.left && !node.right) {
            minDeep = floor
            break
        }
        if(node.left) queue.push([node.left, floor+1])
        if(node.right) queue.push([node.right, floor+1])

    }
    return minDeep
};
```
+ <font color=#9400D3>时间复杂度</font>：`O(n)`，在最差的情况下，可能会遍历到所有的节点
+ <font color=#9400D3>空间复杂度</font>：`O(n)`，在最差的情况下，队列也会保存所有的节点

### 3. 二叉树的层序遍历
<font color=#1E90FF>**① 简单解法**</font>

在`leetcode`上面找到102题号，二叉树的层序遍历，这个题在上面广度优先遍历的基础上，其实解出来比较简单，知道每个节点的层级就能对应的插入到数组的不同元素当中去：
```javascript
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {
    if(!root) return []
    let result  = []
    let queue = [[root, 1]]

    while(queue.length){
        let [node, floor] = queue.shift()

        if(!result[floor-1]) {
            result.push([node.val])
        } else {
            result[floor-1].push(node.val)
        }

        if(node.left) queue.push([node.left, floor+1])
        if(node.right) queue.push([node.right, floor+1])

    }
    return result
};
```
+ <font color=#9400D3>时间复杂度</font>：`O(n)`，需要遍历到所有节点，`n`为节点数量
+ <font color=#9400D3>空间复杂度</font>：`O(n)`，因为队列的长度是不确定的，队列在不停的出队和入队，无法知道在什么时候是最长的。

<font color=#1E90FF>**② 复杂解法**</font>

复杂的解法其实依旧是广度优先遍历，只不过我们实际上不需要知道每个节点的层级，因为比如说对于`[3,9,20,null,null,15,7]`这个树，在3出去后，队列里保存的就是第二层级所有的节点，数量也是知道的，为2个，然后队列出队两个后，队列里一定剩下的全都是第三层级的节点，数量也是知道的，所以，可以去除关于节点层级的操作，来优化时间：
```javascript
var levelOrder = function(root) {
	if(!root) return []
	let result  = []
	let queue = [root]

	while(queue.length){
		let length = queue.length
		let item = []
		for(let i = 0; i< length;i++) {
			let node = queue.shift()
			item.push(node.val)
			if(node.left) queue.push(node.left)
			if(node.right) queue.push(node.right)
		}
		result.push(item)

	}
	return result
};
```
时间复杂度和空间复杂度同上