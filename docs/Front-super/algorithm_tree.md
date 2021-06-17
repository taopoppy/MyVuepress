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