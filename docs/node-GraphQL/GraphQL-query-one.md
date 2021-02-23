# Query（1）

我们学习之前先来在`vscode`当中安装一些插件
+ <font color=#1E90FF>Babel ES6/ES7</font>： `es6/es7`语法的高亮提示
+ <font color=#1E90FF>Beautify</font>：对前端代码进行格式化和高亮提示
+ <font color=#1E90FF>Docker</font>：`docker扩展`
+ <font color=#1E90FF>Duplicate action</font>：`在vscode`当中复制文件和文件夹
+ <font color=#1E90FF>GraphQL for vscode</font>：`GraphQL`的插件
+ <font color=#1E90FF>Material Icon Theme</font>：不同文件图标显示
+ <font color=#1E90FF>npm </font>：`npm`插件

## 搭建node服务器
创建一个`node`的项目我们已经很熟悉了，我们直接按照下面的命令去创建环境即可
```shell
npm init -y
npm install babel-cli
npm install babel-preset-env
npm install nodemon --D
```
然后创建`.babelrc`文件，内容如下：
```javascript
{
	{
		"presets": ["env"]
	}
}
```
然后在`package.json`当中添加启动命令：
```javascript
"script": {
	"start":"nodemon src/index.js -exec babel-node"
}
```
这里解释一下，使用`nodemon`是默认使用`node`去启动文件的，但是我们需要使用`babel-node`去启动文件，因为`babel-node`可以将`es6/es7`的语法转化为`es5`的语法并且直接执行，不会将转化后的文件保存在本地。


## 创建Graphql-API
我们要注意的是:
+ <font color=#1E90FF>我们使用Graphql-playground和Graphql-api进行交互只是临时的一种方式，是用来检验服务器是否正常运行和我们书写的Graphql服务器的逻辑是否正确，最终还是浏览器或者手机终端和服务器的交互</font>

+ <font color=#1E90FF>Graphql是可以整合在任何一种语言中的，因为它本身是一种数据查询语言么，就好比你在node当中可以使用mysql，在java当中使用sql，都一样，所以我们需要一个整合工具，类似于node-mysql或者node-mongodb</font>

我们首先下载整合工具<font color=#9400D3>graphql-yoga</font>
```shell
npm install graphql-yoga
```

然后我们来写一个简单的`GraphQL`服务器：
```javascript
const {GraphQLServer} = require('graphql-yoga')

// 类型定义{schema}
const typeDefs = `
	type Query{
		hello:String!
		name:String!
	}
`

// Resolvers(函数实现)
const resolvers= {
	Query: {
		hello() {
			return "taopoppy"
		},
		name() {
			return "Jeryy"
		}
	}
}

const server = new GraphQLServer({
	typeDefs,
	resolvers
})

server.start(()=> {
	console.log("Server is running on localhost:4000")
})
```

## GraphQL-Scalar类型
`GraphQL`内置了5个类型，分别是<font color=#1E90FF>String</font>、<font color=#1E90FF>Int</font>、<font color=#1E90FF>Float</font>、<font color=#1E90FF>Boolean</font>、<font color=#1E90FF>ID</font>，这些类型都返回的单个值，所以都被称为`Scalar`类型

## GraphQL-自定义类型
```javascript
const {GraphQLServer} = require('graphql-yoga')

// 类型定义{schema}
const typeDefs = `
	type Query{
		me:User!
	}
	type User{
		id:ID!
		name:String!
		email:String!
		age:Int
	}
`

// Resolvers(函数实现)
const resolvers= {
	Query: {
		me() {
			return {
				id: "123",
				name: "Jerry",
				email:"15009571633@163.com",
				//age:15 // 这里age可以不实现，因为定义的时候没有在后面加！，说明可以为null
			}
		}
	}
}

const server = new GraphQLServer({
	typeDefs,
	resolvers
})

server.start(()=> {
	console.log("Server is running on localhost:4000")
})
```

## 操作参数
操作参数是客户端选择性的获取服务端数据的一种方式,我们可以在`Query`当中添加带参数的字段，参数和参数之间使用逗号分隔，同样带！表示必须传递参数，不带的表示可选
```javascript
const {GraphQLServer} = require('graphql-yoga')

// 类型定义{schema}
const typeDefs = `
	type Query{
		greeting(name:String!,age:Int):String!
	}
`

// Resolvers(函数实现)
const resolvers= {
	Query: {
		// 字段的实现函数都有四个参数
		// parent: 涉及到关系类型
		// args: 所以通过query传递来的参数都保存在args当中
		greeting(parent,args,ctx, info) {
			const { name, age } = args
			return age? `${name} is ${age}`:`hello ${name}` // 因为age是可选参数，需要判断是否存在
		},
	}
}

const server = new GraphQLServer({
	typeDefs,
	resolvers
})

server.start(()=> {
	console.log("Server is running on localhost:4000")
})
```
然后我们可以在`localhost:4000`当中去使用：

<img :src="$withBase('/node-graphql-1.png')" alt="query参数">

## 数组
下面我们了解一下服务器怎么返回数组类型，以及怎么将数组类型的数据作为参数传递给服务器：
```javascript
const {GraphQLServer} = require('graphql-yoga')

// 类型定义{schema}
const typeDefs = `
	type Query{
		scores:[Int!]!
		add(nums:[Int!]!):Int!
	}
`

// Resolvers(函数实现)
const resolvers= {
	Query: {
		scores() {
			return [1,2,3]
		},
		add(parent,args,ctx, info) { // 这里要提示的是如果有参数，这个四个参数必须写全
			const { nums } = args
			if(nums.length === 0){
				return 0
			} else {
				return nums.reduce((acc,cur) => acc + cur)
			}
		},
	}
}

const server = new GraphQLServer({
	typeDefs,
	resolvers
})

server.start(()=> {
	console.log("Server is running on localhost:4000")
})
```
<img :src="$withBase('/node-graphql-2.png')" alt="">

上面我们还是比较简单的数组，我们下面来返回一个自定义的数组
```javascript
const {GraphQLServer} = require('graphql-yoga')

const allUsers = [
	{id: "123", name: "wangxiaoming", email: "15009571633@163.com"},
	{id: "124", name: "taozhenchuan", email: "15008600212@163.com"},
	{id: "125", name: "bijingjing", email: "15008600289@163.com"},
]


// 类型定义{schema}
const typeDefs = `
	type Query{
		users(query:String):[User!]!
	}
	type User{
		id:ID!
		name:String!
		email:String!
		age:Int
	}
`

// Resolvers(函数实现)
const resolvers= {
	Query: {
		users(parent, args, ctx, info) {
			const { query } = args
			if(query) {
				return allUsers.filter(value => {
					return value.name.toLowerCase().includes(query.toLowerCase())
				})
			} else {
				return allUsers
			}
		},
	}
}

const server = new GraphQLServer({
	typeDefs,
	resolvers
})

server.start(()=> {
	console.log("Server is running on localhost:4000")
})
```
这样的话，因为参数是可选的，我们就可以通过传递参数来选择我们想要所有的数据，还是一部分的数据

<img :src="$withBase('/node-graphql-3.png')" alt="">