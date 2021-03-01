# 使用mongodb存储数据

## 连接mongodb服务
我们先下载`mongoose`，`mongoose`能使`node`连接`MongoDB`数据库变得非常生动和简单
```shell
npm install mongoose
```
然后我们修改一下`app.js`：
```javascript
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const schema = require('./schema/schema')
const mongoose = require('mongoose') // 1. 引入mongoose

// 2. 连接数据库
const uri = "mongodb+srv://taopoppy:tao3941319=-=@cluster0.tnzd7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(uri,{
	useNewUrlParser: true,
	useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("db connection is successful")
});

const app = express()
app.use('/graphql', graphqlHTTP({
	schema,
	graphiql:true
}))

app.listen(4000, ()=> {
	console.log("server is running on 4000")
})
```

## Create Models
我们首先要分清楚`mongodb`的`schema`和`graphql`中的`schema`，<font color=#1E90FF>前者是定义存储在数据库中的数据结构的，后者是定义graphql查询中的数据结构的</font>

我们添加`models/company.js`和`models/product.js`文件，内容如下：
```javascript
// models/product.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 产品要保存在mongodb中的数据结构，id会自动生成
const productSchema = new Schema({
	name: String,
	category:String,
	companyId:String
})

// 为productSchema这个Schema起一个model别名Product
module.exports = mongoose.model('Product', productSchema)
```
```javascript
// models/company.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 公司要保存在mongodb中的数据结构，id会自动生成
const companySchema = new Schema({
	name: String,
	established: Number
})

// 为companySchema这个Schema起一个model别名Company
module.exports = mongoose.model('Company', companySchema)
```
然后在`schema/schema.js`当中引入：
```javascript
const Product = require('../models/product')
const Company = require('../models/company')
```

## Mutation
关于完整的`schema/schema.js`我们现在给出，其中包括不能为空的字段的写法：
```javascript
const graphql = require('graphql')
const _ = require('lodash')
const {
	GraphQLObjectType,
	GraphQLString, // 字符串类型
	GraphQLID, // ID类型
	GraphQLInt, // 整型
	GraphQLList, // 列表类型
	GraphQLNonNull, // 不能为空类型
	GraphQLSchema
} = graphql
// 引入mongoose定义的类型
const Product = require('../models/product')
const Company = require('../models/company')

const ProductType = new GraphQLObjectType({
	name: 'Product',
	fields: ()=> ({
		id: { type: GraphQLID},
		name: { type: GraphQLString},
		category: { type: GraphQLString},
		company: {
			type: CompanyType,
			resolve(parent, args) {
				// 根据id查数据
				return Company.findById(parent.companyId)
			}
		}
	})
})

const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: ()=> ({
		id: { type: GraphQLID},
		name: { type: GraphQLString},
		established: { type: GraphQLInt},
		products: {
			type: new GraphQLList(ProductType),
			resolve(parent, args){
				// 根据id进行匹配
				return Product.find({
					companyId:parent.id
				})
			}
		}
	})
})

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		product: {
			type: ProductType,
			args: {
				id: { type: GraphQLID}
			},
			resolve(parent, args) {
				// 根据id查数据
				return Product.findById(args.id)
			}
		},
		products: {
			type: new GraphQLList(ProductType),
			resolve(parent, args) {
				// 查询所有数据
				return Product.find({})
			}
		},
		company: {
			type: CompanyType,
			args: {
				id: { type: GraphQLID}
			},
			resolve(parent, args) {
				return Company.findById(args.id)
			}
		},
		companies: {
			type: new GraphQLList(CompanyType),
			resolve(parent,args) {
				// 查询所有数据
				return Company.find({})
			}
		}
	}
})

const Mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		// 增加公司
		addCompany: {
			type: CompanyType,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString)}, // 非空类型
				established: {type: new GraphQLNonNull(GraphQLInt)}
			},
			resolve(parent,args) {
				let company = new Company({
					name:args.name,
					established: args.established
				})
				// 存储在mongodb当中
				return company.save()
			}
		},
		// 增加产品
		addProduct: {
			type: ProductType,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString)},
				category: {type: new GraphQLNonNull(GraphQLString)},
				companyId: {type: new GraphQLNonNull(GraphQLID)}
			},
			resolve(parent,args) {
				// 创建一个mongoose的Models
				let product = new Product({
					name:args.name,
					category: args.category,
					companyId: args.companyId
				})
				// 存储在mongodb当中
				return product.save()
			}
		}
	}
})


module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation
})
```
以上完整的代码可以在[github](https://github.com/taopoppy/node-graphql-api/tree/main/learntext3)上查看到。