# 图

## 概述
图是<font color=#DD1144>网状结构的抽象模型</font>，是一组由边连接的节点，图可以表示任何二元关系，比如道路，航班

+ <font color=#1E90FF>JS中没有图，但是可以用Object和Array构建图</font>
+ 图的表示法：<font color=#9400D3>邻接矩阵</font>、<font color=#9400D3>邻接表</font>，如下图所示：

<img :src="$withBase('/react_algorithm_7.png')" alt="">
邻接矩阵比较好理解，就是如果两个节点之间存在连接，那么在二维数组当中就使用1来表示，同时要注意连接方向，而邻接表的方式其实更好理解，比如上图的图使用邻接表表示如下：

```javascript
{
	A:["B"],
	B:["C","D"],
	C:["E"],
	D:["A"],
	E:["D"]
}
```

使用这种`key:value`的方式，`key`表示节点，`value`表示可以连接到的节点的数量。

图的常用操作包括：<font color=#9400D3>深度优先遍历</font>、<font color=#9400D3>广度优先遍历</font>

### 1.深度优先遍历

<font color=#9400D3>深度优先遍历</font>：尽可能深的搜索图的分支，步骤如下
+ <font color=#1E90FF>访问根节点</font>
+ <font color=#1E90FF>对根节点的没访问过的相邻节点挨个进行深度优先遍历</font>

<img :src="$withBase('/react_algorithm_8.png')" alt="">

如上图，要重点解释的就是什么是没有访问过的相邻节点挨个遍历，就是说从`A`到`B`,然后`B`有两个相邻节点`A`和`C`，而`A`已经被访问过了，如果从`A`到`B`,然后再从`B`到`A`,那么就形成无限循环了，所以对于`B`的相邻节点来说，`A`是已经访问过的，`C`就是没有访问过的。同理`C`的相邻节点`A`也已经在之前就访问过了，所以`A`到`B`到`C`,这个是一次正确的深度遍历。同理`A`到`D`也是一次深度遍历

```javascript
const graph = {
	0:[1,2],
	1:[2],
	2:[0,3],
	3:[3]
}


const visited = new Set()
const dfs = (n) => {
	console.log(n)
	visited.add(n)
	graph[n].forEach(element => {
		if(!visited.has(element)){
			dfs(element)
		}
	});
}

dfs(2)
```

### 2. 广度优先遍历
<font color=#9400D3>广度优先遍历</font>：尽可能先访问离根节点最近的节点，步骤如下：
+	<font color=#1E90FF>新建一个队列吗，把根节点入队</font>
+ <font color=#1E90FF>把队头出队并访问</font>
+ <font color=#1E90FF>把队头的没访问过的相邻节点入队</font>
+ <font color=#1E90FF>重复第二、三步，直到队列为空</font>

```javascript
const graph = {
	0:[1,2],
	1:[2],
	2:[0,3],
	3:[3]
}

const bfs = (graph) => {
	let visited = new Set()
	visited.add(2)
	let queue = [2]

	while(queue.length) {
		let node = queue.shift()
		console.log(node)
		graph[node].forEach(ele => {
			if(!visited.has(ele)) {
				queue.push(ele)
				visited.add(node)  // 这里要注意，在这里将加入队列的元素就加入集合，否则会造成队列里有重复节点的出现
			}
		})
	}
}

bfs(graph)
```

## LeetCode示例

### 1. 65有效数字（状态机）
这个题要使用到一个比较新的解题技巧，<font color=#9400D3>状态机</font>。

<img :src="$withBase('/react_algorithm_9.png')" alt="">

状态机从字面就看出，是不同的状态，比如字符串开始遍历，处于状态0，如果第一个字符是空字符，则还处于状态0，如果第二个字符是`+/-`，字符串就从状态0到了状态1，同理如果第二个字符是0-9之间的某个数字，则字符串就从状态0跳转到状态6,依次类推，最终判断字符串遍历完毕处于什么状态。只有356状态是合法的数字。

解题步骤如下：
+ <font color=#1E90FF>构建一个表示状态的图</font>
+ <font color=#1E90FF>遍历字符串，并沿着图走，如果到了某个节点无路可走就返回false</font>
+ <font color=#1E90FF>遍历结束，如果走到3/5/6，就返回true，否则返回false</font>

```javascript
/**
 * @param {string} s
 * @return {boolean}
 */
var isNumber = function(s) {
    // 构建图
    const graph = {
        0: { 'blank': 0, 'sign': 1, '.': 2, 'digit': 6 },
        1: {  '.': 2, 'digit':6 },
        2: { 'digit': 3 },
        3: { 'e': 4, 'digit': 3 },
        4: { 'sign': 7, 'digit': 5 },
        5: { 'digit': 5},
        6: { 'e': 4, 'digit': 6, '.': 3 },
        7: { 'digit': 5 },
    }

    // 定义状态
    let state = 0
    for(c of s.trim()) {
        if(c >= '0' && c <= '9') {
            c = 'digit'
        } else if (c === ' ') {
            c = 'blank'
        } else if (c === '+' || c === '-') {
            c = 'sign'
        } else if (c === 'e' || c === 'E') {
            c = 'e'
        }

        state = graph[state][c]
        if(state === undefined) {
            return false
        }
    }
    if(state === 3 || state === 5 || state === 6) {
        return true
    } else {
        return false
    }
};
```

可以看到整个状态机的关键所在不是我们写的代码，而是我们最上面画的图，只要你能够构建出一个正确的状态机图，就可以根据图写出正确的代码。
+ <font color=#9400D3>时间复杂度</font>：`O(n)`，`n`为字符串的长度
+ <font color=#9400D3>空间复杂度</font>：`O(1)`，只有一个固定长度的图和状态变量。

<font color=#DD1144>这个题还有解法就是写很多if else，还有正则匹配，但是状态机的学习也可以给我们提示，就是面对条件很多很复杂的过滤，可以通过状态机代替丑陋的if else</font>

### 2. 417太平洋大西洋水流问题
+ 新建两个矩阵，分别记录能流到两个大洋的坐标。
+ 从海岸线，多管齐下，同时深度优先遍历图，过程中填充上述矩阵
+ 遍历两个矩阵，找出能流到两个打样

```javascript
/**
 * @param {number[][]} heights
 * @return {number[][]}
 */
var pacificAtlantic = function(heights) {
    // 第一步，判断意外情况
    if(!heights || !heights[0]) return []

    // 主体部分
    // 创建两个和原本矩阵长度和宽度都相等的矩阵
    // 分别记录可以流入太平洋和大西洋的节点
    let m = heights.length
    let n = heights[0].length
    let flow1 = Array.from({length: m}, ()=> new Array(n).fill(false))
    let flow2 = Array.from({length: m}, ()=> new Array(n).fill(false))


    // 深度优先遍历的函数
    const dfs = (r, c, flow) => {
        // 访问该坐标的上下左右坐标是否满足情况
        flow[r][c] = true
        const fourNode = [[r-1,c],[r+1, c],[r,c-1],[r,c+1]]
        fourNode.forEach(([nr, nc])=> {
            if(
                nr>=0 && nr < m &&
                nc>=0 && nc < n &&   // 条件一：上下左右节点要存在
                !flow[nr][nc] && // 条件二：访问过的节点不再重复访问
                heights[nr][nc] >= heights[r][c] // 条件三：相邻节点比如比该节点的值大
            ){
                dfs(nc, nr, flow)
            }
        })

    }

	for(let r = 0; r < m; r+=1) {
		dfs(r, 0, flow1)
		dfs(r, n-1, flow2)
	}

	for(let c = 0; c < n; c+=1) {
		dfs(0, c, flow1)
		dfs(m-1, c, flow2)
	}

    let result = []
    // 搜集可以同时到达两个大洋的节点
    for(let i = 0; i < m; i++) {
        for(let j = 0; j < n ; j++) {
            if(flow1[i][j] && flow2[i][j]) {
                result.push([i, j])
            }
        }
    }
    return result
};
```
+ <font color=#9400D3>时间复杂度</font>：`O(m*n)`，无论怎么递归和循环，所有节点都会只访问到一次，这也是我们在判断当中添加`!flow[nr][nc]`的原因，标记过为`true`的不会再去重复访问
+ <font color=#9400D3>空间复杂度</font>：`O(m*n)`, 存在我们用来记录的`flow1`和`flow2`，大小是`m*n`，但是`dfs`递归函数也是递归了`m*n`次
