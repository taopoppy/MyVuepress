# Subscription(订阅)

`Subscription`订阅和之前的`Query`查询其实是类似的，<font color=#1E90FF>只不过Query是每次查询的时候才能从服务器上获取数据，而订阅是建立了客户端和服务端实时通信的通道，当服务器更新了数据，客户端可以实时的获取到更新的数据，这个功能也是基于websocket的</font>


## Subscription
我们先来看如何将订阅功能整合到服务器当中
### 1. 定义typeRefs

在`src/schema.graphql`当中定义一个`Subscription`:
```graphql
type Subscription{
	somethingChanged: Int!
}
```
这里先只定义了一个字段`somethingChanged`，方便演示

### 2. 配置PubSub

在`src/index.js`当中：
```javascript
const { GraphQLServer, PubSub } = require('graphql-yoga') // 1. 引入工具
const { Subscription } = require('./resolvers/Subscription') // 2. 引入resolvers当中关于subscription的实现

// 3. 订阅实现
const pubsub = new PubSub()

const resolvers= {
	Comment,
	User,
	Post,
	Query,
	Mutation,
	Subscription // 4. 加入到resolvers当中
}

const server = new GraphQLServer({
	typeDefs:'./src/schema.graphql',
	context: {db, pubsub}, // 5. 将pubsub挂载到context上面，所有resolver当中可以使用到pubsub
	resolvers
})

server.start(()=> {
	console.log("Server is running on localhost:4000")
})
```

### 3. 实现resolver
创建`src/resolvers/Subscription.js`：
```javascript
const Subscription = {
	// 1. 与Mutation和Query不同，这里是函数，是对象
	somethingChanged: {
		// 2. 当客户端在订阅somethingChanged的时候，subscribe就会被调用
		subscribe(parent,args,ctx, info){
			const { pubsub } = ctx
			// 4. 实现发布数据的功能
			let count = 0
			setInterval(() => {
				count++
				// 5.publish方法接收两个参数
				// 第一个是通道名称，通过该通道向外发布数据
				// 第二个是数据内容，和schma.graphql当中的定义保持一致
				pubsub.publish("something_topic", {
					somethingChanged: count
				})
			}, 1000);

			return pubsub.asyncIterator("something_topic") // 3. 实现订阅功能，返回一个通道，通道名称为something_topic
		}
	}
}

module.exports= {
	Subscription
}
```

最后我们就可以在`GraphQLPlayGround`当中订阅字段，可以看到会不断的获取到更新的数据：
<img :src="$withBase('/node-graphql-9.png')" alt="">


## Subscription exercise
知道了如何将订阅整合到服务器当中，我们就来把前面的例子继续拿来做实验。

### 1. 订阅Comment和Post
<font color=#1E90FF>**① 定义typeRefs**</font>

在`src/schema.graphql`当中定义,因为订阅评论需要订阅某个文章的评论，所以需要文章的`id`，返回的是评论本身。而文章不需要任何参数
```graphql
type Subscription{
	comment(postId:ID!):Comment!
	post:Post!
}
```

<font color=#1E90FF>**② 实现订阅**</font>

订阅我们要到`src/resolvers/Subscription.js`当中定义：
```javascript
const Subscription = {
	...
	comment: {
		subscribe(parent, args, ctx, info) {
			const { postId } = args
			const { db, pubsub } = ctx
			// 1. 检查订阅评论所属的文章是否存在
			const post = db.allPosts.find((post) => post.id === postId&&post.published)
			if(!post) {
				throw new Error("订阅评论所属的文章不存在")
			}

			return pubsub.asyncIterator(`comment ${postId}`) // 2.根据不同的id来定义不同的通道
		}
	},

	post: {
		subscribe(parent, args, ctx, info) {
			const { pubsub } = ctx
			return pubsub.asyncIterator(`post`)
		}
	}
}
```

<font color=#1E90FF>**③ 实现发布**</font>

发布的时候如何发布呢？想要客户端实时订阅到服务器的数据，那么就要在创建一个新的评论的时候将其发布到对应的通道当中，所以这个步骤要在`createComment`和`createPost`当中完成：
```javascript
// src/resolvers/Mutation.js
const Mutation = {
	...
	createComment(parent, args, ctx, info) {
		const { db, pubsub } = ctx // 1. 拿到pubsub
		...
		db.allComments.push(comment)
		// 2. 将评论保存在数据库的同时将评论发布出去，通道和数据格式要和定义的时候保持一致
		pubsub.publish(`comment ${data.post}`, {
			comment
		})
		return comment
	},
	createPost(parent, args, ctx, info) {
		const { db, pubsub } = ctx // 1. 拿到pubsub

		db.allPosts.push(post)
		// 2. 如果文章的published属性为true，那么就将文章发布出去
		if(data.published) {
			pubsub.publish("post", {
				post
			})
		}
		return post
	}
}
```

### 2. 订阅不同修改类型的Comment和Post
对于之前的`Post`和`Comment`，我们都只能订阅到新的`Post`和`Comment`，对于删除和修改的，我们订阅不到，为了更全面的完善功能，我们来完善代码

<font color=#1E90FF>**① 修改typeRefs**</font>

```graphql
type Subscription{
	comment(postId:ID!):commentSubscriptionPayload!
	post:postSubscriptionPayload!
}
type postSubscriptionPayload{
	mutation:MutationType!
	data:Post!
}
type commentSubscriptionPayload{
	mutation:MutationType!
	data:Comment!
}
# MutationType当中定义的就是字符串
enum MutationType{
	CREATED
	UPDATED
	DELETED
}
```
因为我们想订阅创建，删除和更新的`Post`和`Comment`，所以我们有必要在返回个客户端的数据当中标注`mutation`的类型，而`mutation`的标注范围就在`CREATED`、`UPDATED`和`DELETED`三者之间，为了防止拼写错误，我们使用了`enum`枚举类型。

<font color=#1E90FF>**② 实现Mutation**</font>

```javascript
const Mutation = {
	createPost(parent, args, ctx, info) {
		const { db, pubsub } = ctx // 1. 拿到pubsub
		...
		db.allPosts.push(post)
		if(data.published) {
			pubsub.publish("post", {
				post: { // 2. 类型和schema.graphql对应一致
					mutation: "CREATED",
					data: post
				}
			})
		}
		return post
	},
	createComment(parent, args, ctx, info) {
		const { db, pubsub } = ctx // 1. 拿到pubsub
		...
		db.allComments.push(comment)
		pubsub.publish(`comment ${data.post}`, {
			comment: { // 2. 类型和schema.graphql对应一致
				mutation: "CREATED",
				data: comment
			}
		})
		return comment
	},
	deletePost(parent,args,ctx,info) {
		const { db, pubsub } = ctx // 1. 拿到pubsub
		...
		db.allComments = db.allComments.filter((comment)=> comment.post!==id)
		if(post.published) {
			pubsub.publish("post", {
				post: { // 2. 类型和schema.graphql对应一致
					mutation: "DELETED",
					data: post
				}
			})
		}
		return post
	},
	deleteComment(parent,args,ctx,info){
		const { db,pubsub } = ctx // 1. 拿到pubsub
		...
		db.allComments = db.allComments.filter((comment)=> comment.id!==id)
		pubsub.publish(`comment ${comment.post}`, {
			comment: { // 2. 类型和schema.graphql对应一致
				mutation: "DELETED",
				data: comment
			}
		})
		return comment
	},
	updatePost(parent, args, ctx, info) {
		const { db,pubsub } = ctx // 1. 拿到pubsub
		...
		// 判断上传
		if(typeof data.published === 'boolean') {
			post.published = data.published
			if(!oldPost.published && post.published) {
				// 文章的published属性由false变为true叫做created
				pubsub.publish("post", {
					post: { // 2. 类型和schema.graphql对应一致
						mutation: "CREATED",
						data: post
					}
				})
			}
			if(oldPost.published && !post.published) {
				// 文章的published属性由true变为false叫做delete
				pubsub.publish("post", {
					post: {
						mutation: "DELETED",
						data: post
					}
				})
			}
		} else if(post.published) {
			// 文章的标题和内容在published为true的情况下变化才叫updated
			pubsub.publish("post", {
				post: {
					mutation: "UPDATED",
					data: post
				}
			})
		}

		return post
	},
	updateComment(parent, args, ctx, info) {
		const { db, pubsub } = ctx  // 1. 拿到pubsub
		...
		pubsub.publish(`comment ${comment.post}`, {
			comment: { // 2. 类型和schema.graphql对应一致
				mutation: "UPDATED",
				data: comment
			}
		})
		return comment
	}
}
```
上面代码的逻辑不用太过研究，只要清楚如何去发布不同`mutation`类型的数据即可。