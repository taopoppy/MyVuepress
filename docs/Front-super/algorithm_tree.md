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

## 二叉树先后中序遍历

### 1. 先序遍历
+ <font color=#1E90FF>访问根节点</font>
+ <font color=#1E90FF>对根节点的左子树进行先序遍历</font>
+ <font color=#1E90FF>对根节点的右子树进行先序遍历</font>

