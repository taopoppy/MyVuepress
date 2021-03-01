# Express搭建服务器

## 初始环境的搭建
之前我们是直接使用了`graphql-yoga`，它是一个基于`exporess`和`apollo-server`开发的出色的`graphql`服务器，现在我们需要自己使用`exporess`来搭建服务器，我们需要`graphql`和`express-graphql`：
```shell
npm install express graphql express-graphql
```
接着我们在`server/app.js`当中书写内容：
```javascript
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const schema = require('./schema/schema')

const app = express()
app.use('/graphql', graphqlHTTP({
	schema,
	graphiql:true // 打开playgroud这个grpahqlGui图形化工具
}))

app.listen(4000, ()=> {
	console.log("server is running on 4000")
})
```
然后在`package.json`当中进行配置启动命令`dev`：`nodemon server/app.js`即可。

## Schema定义
按照上面的代码还并不能完整的启动一个`graphql`服务器，因为我们没有给`graphqlHTTP`传递任何参数，我们首先来定义`schema`：
```javascript
const graphql = require('graphql')
const _ = require('lodash')
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLID,
	GraphQLInt,
	GraphQLSchema
} = graphql

// 产品数据
const productList = [
	{name: 'Windows', category:"操作系统", id:'1'},
	{name: 'SqlServer', category:"数据库", id:'2'},
	{name: 'Photoshop', category:"设计工具", id:'3'}
]

// 公司数据
const companyList = [
	{name: 'Microsoft', established: 1975, id:'1'},
	{name: 'Adobe', established:1982, id:'2'},
	{name: 'Apple', established:1976, id:'3'}
]


// 定义一个产品实体
const ProductType = new GraphQLObjectType({
	name: 'Product',
	fields: ()=> ({
		id: { type: GraphQLID}, // 产品id
		name: { type: GraphQLString}, // 产品名称
		category: { type: GraphQLString} // 产品种类
	})
})

// 定义一个公司实体
const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: ()=> ({
		id: { type: GraphQLID}, // 公司id
		name: { type: GraphQLString}, // 公司名称
		established: { type: GraphQLInt} // 公司成立年份
	})
})

// 定义根查询
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		product: {
			type: ProductType, // 返回信息
			args: {
				id: { type: GraphQLID} // 期望收到一个id的参数
			},
			resolve(parent, args) {
				// 这里从数据库当中获取数据
				return _.find(productList, {id: args.id})
			}
		},
		company: {
			type: CompanyType, // 返回信息
			args: {
				id: { type: GraphQLID} // 期望收到一个id的参数
			},
			resolve(parent, args) {
				// 这里从数据库当中获取数据
				return _.find(companyList, {id: args.id})
			}
		},
	}
})


module.exports = new GraphQLSchema({
	query: RootQuery
})
```
## 关联类型
我们知道，公司和产品之间是有关联关系的，我们在下面展示怎么关联两者
```javascript
const graphql = require('graphql')
const _ = require('lodash')
const {
	GraphQLObjectType,
	GraphQLString, // 字符串类型
	GraphQLID, // ID类型
	GraphQLInt, // 整型
	GraphQLList, // 列表类型
	GraphQLSchema} = graphql

const productList = [
	{name: 'Windows', category:"操作系统", id:'1', companyId: '1'}, // 1. 每个产品都有公司id
	{name: 'SqlServer', category:"数据库", id:'2', companyId: '1'},
	{name: 'Photoshop', category:"设计工具", id:'3', companyId: '2'}
]

const companyList = [
	{name: 'Microsoft', established: 1975, id:'1'},
	{name: 'Adobe', established:1982, id:'2'},
	{name: 'Apple', established:1976, id:'3'}
]


const ProductType = new GraphQLObjectType({
	name: 'Product',
	fields: ()=> ({
		id: { type: GraphQLID},
		name: { type: GraphQLString},
		category: { type: GraphQLString},
		company: {// 2. 产品要关联公司
			type: CompanyType,
			resolve(parent, args) {
				return _.find(companyList,{id: parent.companyId})
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
		products: { // 3. 公司要关联产品
			type: new GraphQLList(ProductType),
			resolve(parent, args){
				return _.filter(productList, {companyId: parent.id})
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
				return _.find(productList, {id: args.id})
			}
		},
		products: {
			type: new GraphQLList(ProductType),
			resolve(parent, args) {
				return productList
			}
		},
		company: {
			type: CompanyType,
			args: {
				id: { type: GraphQLID}
			},
			resolve(parent, args) {
				return _.find(companyList, {id: args.id})
			}
		},
		companies: {
			type: new GraphQLList(CompanyType),
			resolve(parent,args) {
				return companyList
			}
		}
	}
})


module.exports = new GraphQLSchema({
	query: RootQuery
})
```
