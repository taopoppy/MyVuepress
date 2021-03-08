# 完整代码

有了前面的基础，我们来自己整一个比较完整的项目，我们的项目文件都[github](https://github.com/taopoppy/node-graphql-api/tree/main/src)上，可以自行查看，我们列出目录
+ <font color=#1E90FF>controller</font>
	+ <font color=#1E90FF>downloadController.js</font>
	+ <font color=#1E90FF>index.js</font>
	+ <font color=#1E90FF>qrImageController.js</font>
	+ <font color=#1E90FF>upLoaderController.js</font>
+ <font color=#1E90FF>db</font>
	+ <font color=#1E90FF>index.js</font>
+ <font color=#1E90FF>middleware</font>
	+ <font color=#1E90FF>auth.js</font>
+ <font color=#1E90FF>models</font>
	+ <font color=#1E90FF>Comment.js</font>
	+ <font color=#1E90FF>Post.js</font>
	+ <font color=#1E90FF>User.js</font>
	+ <font color=#1E90FF>index.js</font>
+ <font color=#1E90FF>resolvers</font>
	+ <font color=#1E90FF>Comment.js</font>
	+ <font color=#1E90FF>Mutation.js</font>
	+ <font color=#1E90FF>Post.js</font>
	+ <font color=#1E90FF>Query.js</font>
	+ <font color=#1E90FF>Subscription.js</font>
	+ <font color=#1E90FF>User.js</font>
+ <font color=#1E90FF>config.js</font>
+ <font color=#1E90FF>index.js</font>
+ <font color=#1E90FF>schema.graphql</font>

## index.js
项目的入口文件，注释都有详细的说明，对于`GraphQL`服务，有些功能无法通过`json`进行请求和响应，还好`graphiql-yoga`是通过集成`express`和`apollo-server`的项目，我们可以将`express`对象进行抽离。
```javascript
// src/index.js
const { GraphQLServer, PubSub } = require('graphql-yoga')
const express = require('express')
const { connectDB } = require('./db/index')
const { Query } = require('./resolvers/Query')
const { Comment } = require('./resolvers/Comment')
const { Mutation } = require('./resolvers/Mutation')
const { Post } = require('./resolvers/Post')
const { User } = require('./resolvers/User')
const { Subscription } = require('./resolvers/Subscription')

// 文件上传库
const multer  = require('multer');
const upload = multer({ dest: 'public'}) // 文件储存路径

// 引入resuful风格的处理器
const Controller = require('./controller/index')
// 订阅实现
const pubsub = new PubSub()

// Resolvers(函数实现)
const resolvers= {
	Comment,
	User,
	Post,
	Query,
	Mutation,
	Subscription
}

// 创建Graphql服务器
const server = new GraphQLServer({
	typeDefs:'./src/schema.graphql',
	context: (req)=> ({
		pubsub,
		req
	}),
	resolvers,
})

// 连接数据库
connectDB()

// 设置跨域
server.express.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

server.express.use('/static', express.static('public')) // 静态资源访问
server.express.use(express.json()) // for parsing application/json
server.express.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// restful 风格的路由
server.express.post('/api/qrImage', Controller.qrImageController) // 生成二维码返回
server.express.post('/api/uploader',upload.array('images'), Controller.upLoaderController) // 上传多张图片
server.express.get('/api/image/:id', Controller.downloadController) // 下载图片

server.start(()=> {
	console.log("Server is running on localhost:4000")
})
```

## config.js
配置文件，一般我们其实是不采用这样的方式，我们通常会使用`dotenv`来配置，具体的你可以自己去`gihub`研究一下：
```javascript
// config.js
const MONGO_URI="mongodb+srv://taopoppy:tao3941319=-=@cluster0.tnzd7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
//const MONGO_URI = "mongodb://localhost:27017/graphql"
const JWT_SECRET="123456"
const JWT_EXPIRES_IN="30 days"

module.exports = {
	MONGO_URI,
	JWT_SECRET,
	JWT_EXPIRES_IN
}
```

## schema.graphql
```graphql
# 根查询
type Query{
	users(query:String):[User!]!
	posts(query:String): [Post]!
	comments(query:String):[Comment!]!
}

#根突变
type Mutation{
	login(data:LoginInput!):LoginResponse!
	createUser(data:CreateUserInput!):User!
	createPost(data:CreatePostInput!):Post!
	createComment(data:CreateCommentInput!):Comment!
	deleteUser(userid:ID!):User!
	deletePost(postid:ID!):Post!
	deleteComment(commentid:ID!):Comment!
	updateUser(data:UpdateUserInput!):User!
	updatePost(postid:ID!,data:UpdatePostInput!):Post!
	updateComment(commentid:ID!,data:UpdateCommentInput!):Comment!
}

# 登录返回响应类型
type LoginResponse{
	message: String!
	user:User
	token: String
}
#订阅类型
type Subscription{
	comment(postId:ID!):commentSubscriptionPayload!
	post:postSubscriptionPayload!
}
#文章订阅
type postSubscriptionPayload{
	mutation:MutationType!
	data:Post!
}
type commentSubscriptionPayload{
	mutation:MutationType!
	data:Comment!
}
#MutationType当中定义的就是字符串
enum MutationType{
	CREATED
	UPDATED
	DELETED
}
#登录输入类型
input LoginInput{
	email: String!
	password: String!
}

#更新评论输入类型
input UpdateCommentInput{
	text: String
}

#更新文章输入类型
input UpdatePostInput{
	title:String
	body:String
	published:Boolean
}
#更新用户输入类型
input UpdateUserInput{
	username:String
	email:String
	age:Int
	password:String
}
#创建用户的输入类型
input CreateUserInput{
	username:String!
	email:String!
	age:Int
	password:String!
}
#创建文章的输入类型
input CreatePostInput{
	title:String!
	body:String!
	published:Boolean!
}
#创建评论的输入类型
input CreateCommentInput{
	text:String!
	post:ID!
}
#用户类型
type User{
	id:ID!
	username:String!
	email:String!
	age:Int
	posts:[Post]!
	comments:[Comment!]!
}
#文章类型
type Post{
	id:ID!
	title:String!
	body:String!
	published:Boolean!
	author:User!
	comments:[Comment]!
}
#评论类型
type Comment{
	id:ID!
	text: String!
	author:User!
	post:Post!
}
```

## resolvers
### Comment.js
```javascript
// src/resolvers/Comment.js
const { UserModel, PostModel } = require('../models/index')


const Comment = {
	// 根据authorId查看用户（完成）
	async author(parent, args, ctx, info) {
		const author = await UserModel.findById({
			_id: parent.authorId
		})
		return author
	},
	// 根据postId查看评论所在的文章（完成）
	async post(parent, args, ctx, info) {
		const post = await PostModel.findById({
			_id: parent.postId
		})
		return post
	}
}

module.exports = {
	Comment
}
```

### Mutation.js
```javascript
// src/resolvers/Mutation.js
const { v4: uuidv4 } = require('uuid')
const { UserModel, PostModel, CommentModel} = require('../models/index.js')
const { createJwtToken, authenticate } = require('../middleware/auth')
const User = require('../models/User.js')

const Mutation = {
	// 登录（完成）
	async login(parent, args, ctx, info){
		const { data } = args
		const { email, password } = data
		const user = await UserModel.findOne({email}).select("+password")
		if(!user || user.password !== password) {
			throw new Error("用户名或者密码错误")
		}
		// 登录要返回一个token
		const token = createJwtToken({id:user._id,email:user.email})
		return {
			message: "login successfully",
			user,
			token
		}
	},
	// 创建新用户（完成）
	async createUser(parent, args, ctx, info) {
		const { data } = args
		const { email, username, password, age } = data
		const user = await UserModel.findOne({email})
		if(user){
			throw new Error("邮箱已经被占用")
		}
		// 创建新的作者对象
		const newUser = new UserModel({
			username,
			email,
			age,
			password
		})
		await newUser.save()
		return newUser
	},
	// 创建新文章（完成）
	async createPost(parent, args, ctx, info) {
		const { req, pubsub } = ctx
		const { data } = args

		// 创建新文章先要鉴权
		const decodeResult = authenticate(req)
		const {id, email} = decodeResult

		// 判断author是否存在
		const user = await UserModel.findOne({_id: id, email})
		// 如果作者不存在，返回错误
		if(!user) {
			throw new Error("作者不存在")
		}
		const { title, body, published } = data

		// 创建新的文章对象
		const newPost = new PostModel({
			title,
			body,
			published,
			authorId:id
		})
		await newPost.save()
		return newPost
	},
	// 创建新评论（完成）
	async createComment(parent, args, ctx, info) {
		const { req, pubsub } = ctx

		// 创建新文章先要鉴权
		const decodeResult = authenticate(req)
		const {id, email} = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id, email})


		const { data } = args
		const { text, post } = data
		// 判断文章是否存在
		const postExist = await PostModel.findOne({_id: post})
		if(!postExist) {
			throw new Error("要评论的文章不存在")
		}

		// 创建新的评论对象
		const newComment = new CommentModel({
			text,
			authorId: id,
			postId: post
		})
		await newComment.save()
		return newComment
	},
	// 删除用户（完成）
	async deleteUser(parent,args,ctx, info){
		const { req, pubsub } = ctx

		// 删除用户先要鉴权
		const decodeResult = authenticate(req)
		const {id, email} = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id, email})
		if(!user) {
			throw new Error("用户不存在")
		}

		const { userid } = args

		// 判断你要删除的id和自己的id是否一样，只能删除自己
		if(userid !== id) {
			throw new Error("无权删除其他用户")
		}
		// 1. 删除自己
		const userDeleted = await UserModel.findByIdAndDelete(id)
		if(!userDeleted) {
			throw new Error("数据库删除用户失败")
		}

		// 2. 同时要删除该作者写的文章以及文章下所有评论
		const userPosts = await PostModel.find({authorId: id})
		for(let i= 0; i< userPosts.length; i++) {
			// 删除文章下的所有评论
			let everyPost = userPosts[i]
			await CommentModel.deleteMany({postId: everyPost._id})
			// 删除文章自己
			await everyPost.delete()
		}

		// 4. 最后要删除该作者所发表的所有评论
		const commentDeleted = await CommentModel.deleteMany({authorId: id})
		if(!commentDeleted) {
			throw new Error("数据库删除用户相关文章和评论失败")
		}
		return userDeleted
	},
	// 删除文章（完成）
	async deletePost(parent,args,ctx,info) {
		const { req, pubsub } = ctx

		// 删除用户先要鉴权
		const decodeResult = authenticate(req)
		const {id, email} = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id, email})
		if(!user) {
			throw new Error("用户不存在")
		}

		const { postid } = args
		// 判断文章是否存在
		const postDeleted = await PostModel.findById(postid)
		if(!postDeleted){
			throw new Error("要删除的文章不存在")
		}

		// 判断文章的作者是否是用户
		if(postDeleted.authorId !== id) {
			throw new Error("无法删除不是自己写的文章")
		}

		// 2. 删除文章
		const postDeletedResult = await postDeleted.delete()
		// 3. 删除该文章下面所有的评论
		const commentsDeleted = await CommentModel.deleteMany({postId:postid})
		if(!postDeletedResult && commentsDeleted) {
			throw new Error("数据库删除文章相关信息失败")
		}

		return postDeletedResult
	},
	// 删除评论（完成）
	async deleteComment(parent,args,ctx,info){
		const { req, pubsub } = ctx

		// 删除用户先要鉴权
		const decodeResult = authenticate(req)
		const {id, email} = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id, email})
		if(!user) {
			throw new Error("用户不存在")
		}

		const { commentid } = args
		// 判断评论是否存在
		const commentDeleted = await CommentModel.findById(commentid)
		if(!commentDeleted){
			throw new Error("要删除的评论不存在")
		}

		// 判断评论的作者是否是用户
		if(commentDeleted.authorId !== id) {
			throw new Error("无法删除不是自己写的评论")
		}

		// 2. 删除评论
		const commentDeletedResult = await commentDeleted.delete()

		return commentDeletedResult
	},
	// 更新用户信息（完成）
	async updateUser(parent, args, ctx, info) {
		const { req, pubsub } = ctx
		const { data } = args

		// 创建新文章先要鉴权
		const decodeResult = authenticate(req)
		const { id } = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id})
		console.log("user",user)
		if(!user) {
			throw new Error("用户不存在")
		}

		if(data && data.email) {
			// 判断邮箱需要保证唯一性
			const emailExist = await UserModel.findOne({email})
			if(emailExist) {
				throw new Error("新的邮箱已经被占用")
			}
		}

		const userUpdated = await UserModel.findByIdAndUpdate(id,{...data})

		if(!userUpdated){
			throw new Error("数据库更新用户失败")
		}

		return userUpdated
	},
	// 更新文章（完成）
	async updatePost(parent, args, ctx, info) {
		const { req,pubsub } = ctx
		const { postid, data } = args

		// 更新文章先要鉴权
		const decodeResult = authenticate(req)
		const { id } = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id})
		if(!user) {
			throw new Error("用户不存在")
		}

		// 检查更新的文章是否存在
		const oldPost = await PostModel.findById(postid)
		if(!oldPost) {
			throw new Error("文章不存在")
		}
		// 判断用户是否和文章作者一致
		if(id!==oldPost.authorId) {
			throw new Error("无法修改其他作者的文章")
		}

		const { title, body, published } = data
		let newPost = {}

		// 判断标题
		if(typeof title === 'string') {
			newPost.title = title
		}
		// 判断内容
		if(typeof body === 'string') {
			newPost.body = body
		}
		if(typeof published === 'boolean') {
			newPost.published = published
		}
		// 更新文章
		const postUpdated = await PostModel.findByIdAndUpdate(postid,{...newPost})
		if(!postUpdated){
			throw new Error("数据库更新文章失败")
		}

		return postUpdated
	},
	// 更新评论（完成）
	async updateComment(parent, args, ctx, info) {
		const { req,pubsub } = ctx
		const { commentid, data } = args

		// 更新评论先要鉴权
		const decodeResult = authenticate(req)
		const { id } = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id})
		if(!user) {
			throw new Error("用户不存在")
		}

		// 检查更新的评论是否存在
		const oldComment = await CommentModel.findById(commentid)
		if(!oldComment) {
			throw new Error("评论不存在")
		}
		// 判断用户是否和评论作者一致
		if(id!==oldComment.authorId) {
			throw new Error("无法修改其他作者的评论")
		}

		const { text } = data
		let newComment = {}

		// 判断内容
		if(typeof text === 'string') {
			newComment.text = text
		}
		// 更新评论
		const commentUpdated = await CommentModel.findByIdAndUpdate(commentid,{...newComment})
		if(!commentUpdated){
			throw new Error("数据库更新评论失败")
		}

		return commentUpdated
	}
}

module.exports = {
	Mutation
}
```

### Post.js
```javascript
// src/resolvers/Post.js
const { PostModel, UserModel, CommentModel} = require('../models/index')

const Post = {
	// 根据文章的authorid查看用户（完成）
	async author(parent, args, ctx, info) {
		const author = await UserModel.findById({
			_id: parent.authorId
		})
		return author
	},
	// 根据文章查看文章下的所有评论（完成）
	async comments(parent, args, ctx, info) {
		const comments = await CommentModel.find({
			postId: parent._id
		})
		return comments
	}
}

module.exports = {
	Post
}
```

### Query.js
```javascript
// src/resolvers/Query.js
const { UserModel, PostModel, CommentModel } = require('../models/index.js')
const { authenticate } = require('../middleware/auth')

const Query = {
	// 查看评论（完成）
	async comments(parent, args, ctx, info) {
		const { req, pubsub } = ctx

		// 查看用户先鉴权
		const decodeResult = authenticate(req)
		const {id, email} = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id, email})
		if(!user) {
			throw new Error("用户不存在")
		}

		const { query } = args
		let commentone
		if(query!== undefined) {
			commentone = await CommentModel.findById(query)
			if(!commentone) {
				throw new Error("评论不存在")
			}
		} else {
			commentone = await CommentModel.find()
		}
		return Array.isArray(commentone)? commentone: [commentone]
	},
	// 查看用户（完成）
	async users(parent, args, ctx, info) {
		const { req, pubsub } = ctx

		// 查看用户先鉴权
		const decodeResult = authenticate(req)
		const {id, email} = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id, email})
		if(!user) {
			throw new Error("用户不存在")
		}

		const { query } = args
		let userone
		if(query!== undefined) {
			userone = await UserModel.findById(query)
			if(!userone) {
				throw new Error("用户不存在")
			}
		} else {
			userone = await UserModel.find()
		}
		return Array.isArray(userone)? userone: [userone]
	},
	// 查看文章
	async posts(parent, args, ctx, info) {
		const { req, pubsub } = ctx

		// 查看用户先鉴权
		const decodeResult = authenticate(req)
		const {id, email} = decodeResult
		// 判断author是否存在
		const user = await UserModel.findOne({_id: id, email})
		if(!user) {
			throw new Error("用户不存在")
		}

		const { query } = args
		let postone
		if(query!== undefined) {
			postone = await PostModel.findById(query)
			if(!postone) {
				throw new Error("用户不存在")
			}
		} else {
			postone = await PostModel.find()
		}
		return Array.isArray(postone)? postone: [postone]
	}
}

module.exports = {
	Query
}
```

### Subscription.js
```javascript
// src/resolvers/Subscription.js
const Subscription = {
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

module.exports= {
	Subscription
}
```

### User.js
```javascript
// src/resolvers/User.js
const {  CommentModel, PostModel } = require('../models/index')

const User = {
	// 根据用户id查看用户的所有文章（完成）
	async posts(parent, args, ctx, info) {
		const userPosts = await PostModel.find({
			authorId: parent.id
		})
		return userPosts
	},
	// 根据用户id查看用户的所有评论（完成）
	async comments(parent, args, ctx, info) {
		const userComments = await CommentModel.find({
			authorId: parent.id
		})
		return userComments
	}
}

module.exports = {
	User
}
```

## models
### Comment.js
```javascript
// src/models/Comment.js
const mongoose = require("mongoose")

// 评论要保存在mongodb中的格式
const commentSchema = new mongoose.Schema(
  {
    // 评论内容
    text: {
      type: String,
      required: true,
    },
    // 用户id
    authorId: {
      type: String,
      required: true,
    },
    // 评论所属文章id
    postId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("comment", commentSchema)
```
### index
```javascript
// src/models/index.js
module.exports = {
  UserModel: require("./User"),
  PostModel: require("./Post"),
  CommentModel: require("./Comment"),
}
```
### Post.js
```javascript
// src/models/Post.js
const mongoose = require("mongoose")

// 文章要保存在数据库中的格式
const postSchema = new mongoose.Schema(
  {
    // 作者id
    authorId: {
      type: String,
      required: true,
    },
    // 文章标题
    title: {
      type: String,
      required: true,
    },
    // 文章内容
    body: {
      type: String,
      required: true,
    },
		// 文章是否公开
		published: {
			type: Boolean,
			required: true,
		}
  },
  { timestamps: true }
)

module.exports = mongoose.model("post", postSchema)
```

### User.js
```javascript
// src/models/User.js
const mongoose = require("mongoose")

// 用户在mongodb中的存储格式
const userSchema = new mongoose.Schema(
  {
    // 用户名称
    username: {
      type: String,
      required: true,
    },
    // 用户密码
    password: {
      type: String,
      required: true,
      select: false, // 默认不会在查询中返回
    },
		age: {
			type: Number,
			required: false
		},
    // 用户邮箱
    email: {
      type: String,
      required: true,
      unique: true, // 唯一索引
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ], // 验证器
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("user", userSchema)
```

## middleware
### auth.js
```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config')

// 为用户生成Token
const createJwtToken = (user) => {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

// 鉴权
const authenticate = (req) => {
	const header = req.request.headers.authorization
	if(!header) {
		throw new Error("no authention, please login first")
	}
  const token = header.replace("Bearer ", "")

  const decoded = jwt.verify(token, JWT_SECRET)
	return decoded
}

module.exports = {
	createJwtToken,
	authenticate
}
```

## db
### index.js
```javascript
// src/db/index.js
const mongoose = require("mongoose")
const { MONGO_URI } = require('../config.js')

const connectDB = async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
		useFindAndModify:false,
		useCreateIndex:true
  })
  console.log(`MongoDB connected`)
}

module.exports = { connectDB }
```

## controller
### index.js
```javascript
// src/controller/index.js
module.exports = {
  downloadController: require("./downloadController"),
  qrImageController: require("./qrImageController"),
  upLoaderController: require("./upLoaderController"),
}
```
### downloadController.js
```javascript
// src/controller/downloadController.js
const path = require('path')
const fs = require('fs')

const downloadController = (req, res) => {
	let imageId = req.params["id"]
	let filePath = path.join(__dirname,'../../public',`${imageId}`)
	const fileStream = fs.createReadStream(filePath)
	res.writeHead(200, {'Content-Type': 'image/png'})
	fileStream.pipe(res)
}

module.exports = downloadController
```
### qrImageController.js
```javascript
// src/controller/qrImageController.js
const qr = require('qr-image')
// 加载加密库
const CryptoJS = require("crypto-js");
// 加载DES算法
const tripledes = require("crypto-js/tripledes");

const qrImageController = (req, res)=> {
	console.log("req.body", req.body)
	// 1.拿到his发来请求中携带的用户id
	const { hosptialid, insurcetype, name, sex, idcard, age } = req.body
	if(!hosptialid || !insurcetype || !name || !sex || !idcard || (typeof idcard) !== 'string'){
		res.status(400)
		res.json({
			"message":"The fields are missing or wrong"
		})
		return
	}

	// 2. 生成二维码信息
	let message = JSON.stringify({...req.body})

	// 3. 生成秘钥
	const key = idcard

	// 4. 通过对称加密DES加密信息（秘钥就是用户自己的id）
	const encryptResult = tripledes.encrypt(message, key).toString()

	// 解密写法
	// try {
	// 	let plaintext  = tripledes.decrypt(encryptResult, key).toString(CryptoJS.enc.Utf8)
	// 	console.log("plaintext",plaintext)
	// 	console.log(JSON.parse(plaintext))
	// } catch (error) {
	// 	console.log("解析失败",error.toString())
	// }

	// 5. 根据加密信息生成二维码进行返回
	const temp_qrcode = qr.image(encryptResult, {type: 'png'})
	res.writeHead(200, {'Content-Type': 'image/png'})
	temp_qrcode.pipe(res)
}

module.exports = qrImageController
```
### upLoaderController.js
```javascript
// src/controller/upLoaderController.js

const upLoaderController = (req, res)=> {
	let files = req.files;
	// file信息如下
	// {
	// 	fieldname: 'avatar',
	// 	originalname: 'kq.png',
	// 	encoding: '7bit',
	// 	mimetype: 'image/png',
	// 	destination: 'public/',
	// 	filename: '6f7d1a63467c6388383cabd64240a7bb',
	// 	path: 'public\\6f7d1a63467c6388383cabd64240a7bb',
  // 	size: 98036
	// }
	// 存路径到数据库
	let resFileIdArray = []
	if(Array.isArray(files)) {
		resFileIdArray = files.map(file => {
			return file.filename
		})
	}
  res.json(
		{
			message: resFileIdArray.length === 0 ?"failed": "ok",
			fildId: resFileIdArray
		}
	);
}

module.exports = upLoaderController
```
