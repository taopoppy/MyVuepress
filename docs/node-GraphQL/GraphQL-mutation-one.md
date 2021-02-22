# mutation

首选我们在学习之前，我们提前下载好几个库，这个章节所有的内容都是在之前的基础上，所以之前相同且写过的代码，我都会省略掉，但是最终会给出完整的代码：
```shell
npm install uuid
npm install babel-plugin-transform-object-rest-spread
```
然后在`.babelrc`当中的配置如下：
```javascript
{
	"presets": ["env"],
	"plugins": ["transform-object-rest-spread"]
}
```
注意，`babel-plugin-transform-object-rest-spread`这个`babel`插件是为了解决低版本的`node`不识别`es6`的展开运算符的问题的，在高版本的`node`当中，程序是不需要安装这个玩意的



## create(增)
### 1. create
```typescript
const {GraphQLServer} = require('graphql-yoga')
const {v4: uuidv4} = require('uuid')

const typeDefs = `
	type Query{
		users(query:String):[User!]!
		posts(query:String): [Post]!
		comments:[Comment!]!
	}
	type Mutation{
		createUser(name:String!,email:String!,age:Int):User!
	}
	type User{
		id:ID!
		name:String!
		email:String!
		age:Int
		posts:[Post]!
		comments:[Comment!]!
	}
`

const resolvers= {
	...
	Mutation: {
		createUser(parent, args, ctx, info) {
			const { name, email, age } = args
			// 判断提交的参数，保证邮箱的唯一性
			const emailToken = allUsers.some((user)=> {
				return user.email===email
			})
			if(emailToken){
				throw new Error("邮箱已经被占用")
			}
			const user = {
				id: uuidv4(),
				name,
				email,
				age
			}
			allUsers.push(user) // 保存在数据库当中
			return user // 返回新创建的用户
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
可以看到我们申明了`type Mutation`,和`query`是一样的申明格式，然后在`resolvers`函数实现当中基本写法也没有太多变化，逻辑我们都在上述代码当中进行了注释。
<img :src="$withBase('/node-graphql-7.png')" alt="">
<img :src="$withBase('/node-graphql-8.png')" alt="">

下面我们就来完成`createPost`和`createComment`:
```javascript
const {GraphQLServer} = require('graphql-yoga')
const {v4: uuidv4} = require('uuid')

// 类型定义{schema}
const typeDefs = `
	type Mutation{
		createUser(name:String!,email:String!,age:Int):User!
		createPost(title:String!,body:String!,published:Boolean!,author:ID!):Post!
		createComment(text:String!,author:ID!,post:ID!):Comment!
	}
`

// Resolvers(函数实现)
const resolvers= {
	Mutation: {
		createUser(parent, args, ctx, info) {
			const { name, email, age } = args
			const emailToken = allUsers.some((user)=> {
				return user.email===email
			})
			if(emailToken){
				throw new Error("邮箱已经被占用")
			}
			// 创建新的作者对象
			const user = {
				id: uuidv4(),
				...args
			}
			allUsers.push(user) // 将新的用户保存在数据库当中
			return user // 返回新的用户信息
		},
		createPost(parent, args, ctx, info) {
			const { author, title, body, published} = args
			// 判断author是否存在
			const authorExist = allUsers.some((user)=> {
				return user.id === author
			})
			// 如果作者不存在，返回错误
			if(!authorExist) {
				throw new Error("作者不存在")
			}

			// 创建新的文章对象
			const post={
				id: uuidv4(),
				...args
			}

			allPosts.push(post) // 将文章保存在数据库
			return post // 返回新的文章信息
		},
		createComment(parent, args, ctx, info) {
			const { text, author,post } = args
			// 判断作者和文章是否存在
			const authorExist = allUsers.some((user)=> {
				return user.id === author
			})
			const postExist = allPosts.some((pos)=> {
				return pos.id === post && pos.published // 这里要判断文章存在的同时也要判断文章是否是公开的
			})

			if(!authorExist || !postExist){
				throw new Error("作者或者文章不存在")
			}
			// 创建新的评论对象
			const comment = {
				id: uuidv4(),
				...args
			}

			allComments.push(comment) // 将评论保存在数据库当中
			return comment
		}
	}
}
```

### 2. input类型
前面我们在`createComment`、`createPost`和`createUser`当中传递的参数都是单个的参数，下面我们将学习`Graphql`当中的内置类型<font color=#9400D3>input类型</font>
```javascript
const typeDefs = `
	type Mutation{
		createUser(data:CreateUserInput!):User!
		createPost(data:CreatePostInput!):Post!
		createComment(data:CreateCommentInput!):Comment!
	}
	input CreateUserInput{
		name:String!
		email:String!
		age:Int
	}
	input CreatePostInput{
		title:String!
		body:String!
		published:Boolean!
		author:ID!
	}
	input CreateCommentInput{
		text:String!
		author:ID!
		post:ID!
	}
`

const resolvers= {
	Mutation: {
		createUser(parent, args, ctx, info) {
			const { data } = args // 1. 这里只解构出data，data当中包含这name，email，age
			const emailToken = allUsers.some((user)=> {
				return user.email===data.email // 2. 使用的是data.email
			})
			if(emailToken){
				throw new Error("邮箱已经被占用")
			}
			const user = {
				id: uuidv4(),
				...data  // 3.这里解构data即可
			}
			allUsers.push(user)
			return user
		}
	}
}
```
然后`createComment`、`createPost`的改法和上述的`createUser`是一模一样，只不过我们在`Graphql`当中查询的时候就要注意，传递参数的时候不再是之前的零散的三个参数，而是`data`这一个对象。

<font color=#1E90FF>input类型是一种抽离参数的抽象类型，实际上让我们的代码更加简洁易懂，如果参数有很多，都零散的写上去，一定是不雅观的</font>

## delete(删)
### 1. delete
```javascript
const typeDefs = `
	type Mutation{
		deleteUser(id:ID!):User!
		deletePost(id:ID!):Post!
		deleteComment(id:ID!):Comment!
	}
`
const resolvers= {
	Mutation: {
		deleteUser(parent,args,ctx, info){
			const { id } = args
			const user = allUsers.find((user)=> user.id === id)
			if(!user) {
				throw new Error("作者不存在")
			}
			// 1. 删除作者
			allUsers = allUsers.filter((user)=> user.id !==id)

			// 2. 同时要删除该作者写的文章
			allPosts = allPosts.filter((post) => {
				const match = post.author === id
				// 同时删除该文章下的所有评论
				if(match) {
					allComments = allComments.filter((comment)=> comment.post!==post.id)
				}

				return !match
			})

			// 3. 最后要删除该作者所发表的所有评论
			allComments = allComments.filter((comment)=> comment.author!==id)
			return user
		},
		deletePost(parent,args,ctx,info) {
			const { id } = args
			// 1.先检查文章存在否
			const post = allPosts.find((post) => post.id ===id)
			if(!post){
				throw new Error("文章不存在")
			}

			// 2. 删除文章
			allPosts = allPosts.filter((post)=> post.id!==id)

			// 3. 删除该文章下面所有的评论
			allComments = allComments.filter((comment)=> comment.post!==id)

			return post
		},
		deleteComment(parent,args,ctx,info){
			const { id } = args
			// 1.先检查评论存在否
			const comment = allComments.find((comment) => comment.id ===id)
			if(!comment){
				throw new Error("评论不存在")
			}

			// 2. 删除评论
			allComments = allComments.filter((comment)=> comment.id!==id)

			return comment
		}
	}
}
```
同样看到，删除的操作也是比较简单，只是对于我们举的例子来说，我们删除用户就要相应的删除用户所有写的文章和所有书写的评论，删除文章要删除对应的所有评论，删除评论就只删除评论，<font color=#1E90FF>所以通过这个简单的例子我们应该在书写后台的时候在删除的时候要考虑到关联性</font>

### 2. refactor
可以看到，我们之前的代码都是全部写在了`index.js`当中，然后我们需要重构一下代码，让代码更加的工程化。

<font color=#1E90FF>**① 分离schema**</font>

创建`src/schema.graphql`,抽离出之前书写的`typeDefs`到这里，然后我们修改`package.json`文件，因为`nodemon`默认不监听`.graphql`文件的变化，我们让他监听：
```javascript
"script": {
	"start": "nodemon src/index.js  --ext js,json,graphql -exec babel-node"
}
```

最后，因为`typeDefs`被抽离出去了，所以我们创建`GraphQLServer`的时候在`typeDefs`属性当中要书写文件路径：
```javascript
const server = new GraphQLServer({
	typeDefs:'./src/schema.graphql', // 路径
	resolvers
})
```

<font color=#1E90FF>**② 分离db**</font>

创建`src/db.js`，然后将之前书写的`mock`数据全部移动到这里。

但是我们在`resolvers`之前都是直接使用`mock`数据的，后面`resolvers`也需要使用`db`当中的`mock`的数据，难道在所有的`resolvers`当中都要引入`db.js`么。<font color=#1E90FF>不需要，通过在创建GraphqlServer的时候将db数据挂载到ctx上面，即可在所有resolvers函数当中通过ctx解构出db</font>
```javascript
const { db } = require('./db.js') // 引入

const server = new GraphQLServer({
	typeDefs:'./src/schema.graphql',
	context: {db}, // 挂载
	resolvers
})
```
最后要做的就是将`resolvers`当中所有函数当中使用的数据都使用`db.xxx`代替

<font color=#1E90FF>**③ 分离resolver**</font>

将`Query`、`Mutation`、`Post`、`User`、`Comment`都分离到`src/resolvers/`当中的不同文件当中，然后在`src/index.js`当中代码就十分简洁：
```javascript
const { GraphQLServer } = require('graphql-yoga')
const { db } = require('./db.js')
const { Query } = require('./resolvers/Query')
const { Comment } = require('./resolvers/Comment')
const { Mutation } = require('./resolvers/Mutation')
const { Post } = require('./resolvers/Post')
const { User } = require('./resolvers/User')

// Resolvers(函数实现)
const resolvers= {Comment,User,Post,Query,Mutation}

const server = new GraphQLServer({
	typeDefs:'./src/schema.graphql',
	context: {db},
	resolvers
})

server.start(()=> {
	console.log("Server is running on localhost:4000")
})
```

## update(改)
我们首先到`src/schema.graphql`当中添加`typeDefs`：
```graphql
type Mutation{
	updateUser(id:ID!,data:UpdateUserInput!):User!
	updatePost(id:ID!,data:UpdatePostInput!):Post!
	updateComment(id:ID!,data:UpdateCommentInput!):Comment!
}
input UpdateCommentInput{
	text: String
}
input UpdatePostInput{
	title:String
	body:String
	published:Boolean
}
input UpdateUserInput{
	name:String
	email:String
	age:Int
}
```
要注意的是，既然是修改，那么参数都是可写可不写的。然后到`src/resolvers/Mutation.js`当中添加`resolvers`实现函数：
```javascript
const { v4: uuidv4 } = require('uuid')

const Mutation = {
	......
	updateUser(parent, args, ctx, info) {
		const { db } = ctx
		const { id, data } = args
		// 判断用户是否存在
		const user = db.allUsers.find((user)=> user.id === id)
		if(!user) {
			throw new Error("用户不存在")
		}

		// 判断邮箱需要保证唯一性
		if(typeof data.email === 'string') {
			const emailToken = db.allUsers.some((user)=> user.email ===data.email)
			if(emailToken){
				throw new Error("新的邮箱已经被占用")
			}
			user.email = data.email
		}
		// 修改名称和年龄比较随意
		if(typeof data.name === 'string') {
			user.name = data.name
		}
		// age也可以为null
		if(typeof data.age !== 'undefined') {
			user.age = data.age
		}
		return user
	},
	updatePost(parent, args, ctx, info) {
		const { db } = ctx
		const { id, data } = args
		// 检查更新的文章是否存在
		const post = db.allPosts.find((post) => post.id === id)
		if(!post) {
			throw new Error("要修改的文章不存在")
		}
		// 判断标题
		if(typeof data.title === 'string') {
			post.title = data.title
		}
		// 判断内容
		if(typeof data.body === 'string') {
			post.body = data.body
		}
		// 判断上传
		if(typeof data.published === 'boolean') {
			post.published = data.published
		}
		return post
	},
	updateComment(parent, args, ctx, info) {
		const { db } = ctx
		const { id, data } = args
		// 检查评论是否存在
		const comment = db.allComments.find((comment)=> comment.id === id)
		if(!comment) {
			throw new Error("要修改的评论不存在")
		}
		// 判断评论内容
		if(typeof data.text === 'string') {
			comment.text = data.text
		}
		return comment
	}
}

module.exports = {
	Mutation
}
```
至此，`CURD`全部实现完毕。代码请在[github](https://github.com/taopoppy/node-graphql-api/tree/main/learntext)查看。