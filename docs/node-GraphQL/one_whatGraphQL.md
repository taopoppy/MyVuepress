# Schema和Query

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
