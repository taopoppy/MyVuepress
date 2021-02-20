# Schema和Query（2）

## 相关数据
### 1. 单向关联
相关数据允许我们在自定义数据之间建立关联，我们首先来看一下：
```javascript
const {GraphQLServer} = require('graphql-yoga')

const allUsers = [
	{id: "123", name: "wangxiaoming", email: "15009571633@163.com"},
	{id: "124", name: "taozhenchuan", email: "15008600212@163.com"},
	{id: "125", name: "bijingjing", email: "15008600289@163.com"},
]

const allPosts = [
	{ id: "12",title: "Graphql",body:"study Graphql",published:false,author: "123" },
	{ id: "13",title: "Java",body:"study Java",published:true,author: "124" },
	{ id: "14",title: "Golang",body:"study Golang",published:false,author: "124" },
	{ id: "15",title: "Javascript",body:"study Javascript",published:true,author: "125" },
]

// 类型定义{schema}
const typeDefs = `
	type Query{
		users(query:String):[User!]!
		posts(query:String): [Post]!
	}
	type User{
		id:ID!
		name:String!
		email:String!
		age:Int
	}
	type Post{
		id:ID!
		title:String!
		body:String!
		published:Boolean!
		author:User!
	}
`

const resolvers= {
	Post: {
		// 此时这个parent指的就是post
		author(parent, args, ctx, info) {
			// 此时的parent.author的值是id那个字符串，根据id然后到allUsers当中查找完整的User对象返回
			// 这样就实现了在服务端数据当中post中保存的author是user的id，但返回给客户端的是完整的user对象
			return allUsers.find(ele => ele.id===parent.author)
		}
	},
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
		posts(parent, args, ctx, info) {
			const {query} = args
			if(query) {
				return allPosts.filter(value => {
					return value.title.toLowerCase().includes(query.toLowerCase()) ||
								 value.body.toLowerCase().includes(query.toLowerCase())
				})
			} else {
				return allPosts
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

### 2. 双向关联
双向关联实际上就是两个单项关联：
```javascript
const {GraphQLServer} = require('graphql-yoga')

const allUsers = [
	{id: "123", name: "wangxiaoming", email: "15009571633@163.com"},
	{id: "124", name: "taozhenchuan", email: "15008600212@163.com"},
	{id: "125", name: "bijingjing", email: "15008600289@163.com"},
]

const allPosts = [
	{ id: "12",title: "Graphql",body:"study Graphql",published:false,author: "123" },
	{ id: "13",title: "Java",body:"study Java",published:true,author: "124" },
	{ id: "14",title: "Golang",body:"study Golang",published:false,author: "124" },
	{ id: "15",title: "Javascript",body:"study Javascript",published:true,author: "125" },
]

// 类型定义{schema}
const typeDefs = `
	type Query{
		users(query:String):[User!]!
		posts(query:String): [Post]!
	}
	type User{
		id:ID!
		name:String!
		email:String!
		age:Int
		posts:[Post]!
	}
	type Post{
		id:ID!
		title:String!
		body:String!
		published:Boolean!
		author:User!
	}
`

const resolvers= {
	User: {
		// 此时这个parent就是user
		posts(parent, args, ctx, info) {
			return allPosts.filter(post=> post.author===parent.id)
		}
	},
	Post: {
		author(parent, args, ctx, info) {
			return allUsers.find(user => user.id===parent.author)
		}
	},
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
		posts(parent, args, ctx, info) {
			const {query} = args
			if(query) {
				return allPosts.filter(value => {
					return value.title.toLowerCase().includes(query.toLowerCase()) ||
								 value.body.toLowerCase().includes(query.toLowerCase())
				})
			} else {
				return allPosts
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

### 3. 多项关联
我们现在有个需求，要求在`User`(用户)、`Post`(文章)、`Comment`(评论)三者之间存在联系，我们看下面这个复杂的案例
```javascript
const {GraphQLServer} = require('graphql-yoga')

const allUsers = [
	{id: "123", name: "wangxiaoming", email: "15009571633@163.com"},
	{id: "124", name: "taozhenchuan", email: "15008600212@163.com"},
	{id: "125", name: "bijingjing", email: "15008600289@163.com"},
]

const allPosts = [
	{ id: "12",title: "Graphql",body:"study Graphql",published:false,author: "123" },
	{ id: "13",title: "Java",body:"study Java",published:true,author: "124" },
	{ id: "14",title: "Golang",body:"study Golang",published:false,author: "124" },
	{ id: "15",title: "Javascript",body:"study Javascript",published:true,author: "125" },
]

const allComments = [
	{ id: "101", text:"nice class",author: "123",post: "12"},
	{ id: "102", text:"php is best language",author: "123",post: "14" },
	{ id: "103", text:"I wanna study typescript",author: "125",post: "15" }
]

// 类型定义{schema}
const typeDefs = `
	type Query{
		users(query:String):[User!]!
		posts(query:String): [Post]!
		comments:[Comment!]!
	}
	type User{
		id:ID!
		name:String!
		email:String!
		age:Int
		posts:[Post]!
		comments:[Comment!]!
	}
	type Post{
		id:ID!
		title:String!
		body:String!
		published:Boolean!
		author:User!
		comments:[Comment]!
	}
	type Comment{
		id:ID!
		text: String!
		author:User!
		post:Post!
	}
`

// Resolvers(函数实现)
const resolvers= {
	// type Comment的函数实现
	Comment: {
		author(parent, args, ctx, info) {
			return allUsers.find(user => user.id===parent.author)
		},
		post(parent, args, ctx, info) {
			return allPosts.find(post => post.id===parent.post)
		}
	},
	// type User的函数实现
	User: {
		posts(parent, args, ctx, info) {
			return allPosts.filter(post=> post.author===parent.id)
		},
		comments(parent, args, ctx, info) {
			return allComments.filter(comment=> comment.author===parent.id)
		}
	},
	// type Post的函数实现
	Post: {
		author(parent, args, ctx, info) {
			return allUsers.find(user => user.id===parent.author)
		},
		comments(parent, args, ctx, info) {
			return allComments.filter(comment => comment.post===parent.id)
		}
	},
	Query: {
		comments(parent, args, ctx, info) {
			return allComments
		},
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
		posts(parent, args, ctx, info) {
			const {query} = args
			if(query) {
				return allPosts.filter(value => {
					return value.title.toLowerCase().includes(query.toLowerCase()) ||
								 value.body.toLowerCase().includes(query.toLowerCase())
				})
			} else {
				return allPosts
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
关联的关系是这样的：
+ 搜索用户，可以查询到用户的所有文章，用户的所有评论
+ 搜索文章，可以查询文章所隶属的作者，文章的所有评论
+ 搜索评论，可以查询评论是哪个人说的，评论隶属的哪个文章

我们来看看最后查询的情况
<img :src="$withBase('/node-graphql-4.png')" alt="">
<img :src="$withBase('/node-graphql-5.png')" alt="">
<img :src="$withBase('/node-graphql-6.png')" alt="">
