# 搜索页面
+ <font color=#9400D3>GET /search/repositories</font>：根据关键字搜索仓库信息（[Search repositories](https://developer.github.com/v3/search/#search-repositories))）

这个api比较复杂，我们来举个官网的例子来说一下：
```javascript
https://api.github.com/search/repositories?q=react+language:javascript&sort=stars&order=desc&page=4
```
这个接口就是查询`react`仓库，语言是`javascript`，排序顺序按照`stars`多少排序，`order`表示降序，`page`表示分页的第几页，当然默认是每页100个数据，当然也可以通过`page_size`去设置

## 搜索接口联调
```javascript
// pages/search.js
import { withRouter } from "next/router";
import api from '../lib/api'
import { Row, Col,List } from 'antd'
import Link from 'next/link'

// 1. 自定义语言列表
const LANGUAGE = ['Javascript','HTML','CSS','Typescript','Java','Rust',]
// 2. 自定义排序列表
const SORT_TYPES = [
	{ name: 'Best Match'}, // 综合排序
	{ name: 'Most Starts', value: 'stars', order: 'desc'}, // 最多的stars
	{ name: 'Fewest Starts', value: 'stars', order: 'asc'},// 最少的stars
	{ name: 'Most Forks', value: 'forks', order: 'desc'},  // 最多的forks
	{ name: 'Fewest Forks', value: 'forks', order: 'asc'} // 最少的forks
]


/**
 * sort:排序方式
 * order:排序顺序
 * lang：仓库的项目开发主语言
 * page：分页页面
 */
function Search({router,repos}) {
	console.log(repos)
	return (
		<div className="root">
			<Row gutter={20}>
				<Col span={6}>
					<List
						bordered
						header={<span className="list-header">语言</span>}
						style={{marginBottom:20,marginTop:10}}
						dataSource={LANGUAGE}
						renderItem={item => {
							return (
								<List.Item key={item}>
									<Link href="/search">
										<a>{item}</a>
									</Link>
								</List.Item>
							)
						}}
					/>
					<List
						bordered
						header={<span className="list-header">排序</span>}
						dataSource={SORT_TYPES}
						renderItem={item => {
							return (
								<List.Item key={item.name}>
									<Link href="/search">
										<a>{item&&item.name}</a>
									</Link>
								</List.Item>
							)
						}}
					/>
				</Col>
			</Row>
		</div>
	)
}

Search.getInitialProps = async ({ctx})=> {
	const { query, sort, lang, order, page } = ctx.query
	// 3. 如果搜索条件不存在，则不请求数据
	if(!query) {
		return {
			repos: {
				total_count: 0
			}
		}
	}
	// 4. 根据不同的条件形成不同的查询query字符串
	let queryString = `?q=${query}`
	if (lang) queryString += `+language:${lang}`
	if (sort) queryString += `&sort=${sort}$order=${order||'desc'}`
	if (page) queryString += `&page=${page}`

	// 5. 请求查询仓库的地址
	const result = await api.request({
		url:`/search/repositories${queryString}`,
	},ctx.req,ctx.res)

	return {
		repos: (result && result.data)? result.data: {}
	}
}

export default withRouter(Search)
```
## 搜索条件的实现
按照上面的开发，我们排序条件的列表就已经实现了，现在我们要实现点击列表中的某一项，搜索就会按照点击的条件进行搜索，我们要实现两个函数，一个是关于语言类型的搜索，一个是排序顺序的搜索:
```javascript
//pages/search.js
import Router,{ withRouter } from "next/router";

// 1. 设置被选中的样式
const selectedItemStyle = {
	borderLeft: '2px solid #e36209',
	fontWeight: 100
}

function Search({router,repos}) {
	// 2. 拿到路由上的查询参数
	const { sort, order, lang, query} = router.query

	// 3. 在语言列表中的点击事件，会根据当前选中的条件重新跳转路由
	const handlelanguageChange = (language) => {
		Router.push({
			pathname: '/search',
			query: {
				query,
				lang:language,
				sort,
				order
			}
		})
	}
	// 4. 在排序列表中的点击事件，会根据当前选中的条件重新跳转路由
	const handleSortChange = (sort) => {
		Router.push({
			pathname: '/search',
			query: {
				query,
				lang,
				sort:sort.value,
				order:sort.order
			}
		})
	}


	return (
		<div className="root">
			<Row gutter={20}>
				<Col span={6}>
					<List
						bordered
						header={<span className="list-header">语言</span>}
						style={{marginBottom:20,marginTop:10}}
						dataSource={LANGUAGE}
						renderItem={item => {
							// 5. 判断当前语言选择的item是否和路由的查询条件一样，一样就显示被选中的样式
							const selected = lang === item
							return (
								<List.Item key={item} style={selected? selectedItemStyle: null}>
									<a onClick={()=> handlelanguageChange(item)}>{item}</a>
								</List.Item>
							)
						}}
					/>
					<List
						bordered
						header={<span className="list-header">排序</span>}
						dataSource={SORT_TYPES}
						renderItem={item => {
							// 6. 判断当前排序选择的item是否和路由的查询条件一样，一样就显示被选中的样式
							let selected = false
							if (item.name === 'Best Match' && !sort) {
								selected = true
							} else if (item.value === sort && item.order === order) {
								selected = true
							}
							return (
								<List.Item key={item.name} style={selected? selectedItemStyle: null}>
									<a onClick={()=> handleSortChange(item)}>{item&&item.name}</a>
								</List.Item>
							)
						}}
					/>
				</Col>
			</Row>
		</div>
	)
}
```
## 搜索页面跳转的优化
经过上面的代码编写之后，我们有个很重要的问题，就是虽然实现了功能，但在优化的方面有比较大的问题：
+ <font color=#DD1144>a标签上添加click事件通常不是一件正确的事情，尤其对于SEO优化是不友好的</font>
+ <font color=#DD1144>另外对于给onClick事件使用匿名函数调用自定义函数传入参数，本身有很多问题，最大的一个问题就是匿名函数在组件每次重新渲染的时候不会复用，都会作为新的匿名函数重新声明，对于搜索页面，每个搜索条件都是链接，那必定会造成组件的重复渲染，这就有性能问题的存在，所以我们可以将这种单独拿出去申明一个子组件，而子组件如果是纯粹根据props更新的，就可以使用memo优化</font>

```javascript
// pages/search.js
import { memo } from 'react'
import Link from 'next/link'

// 2. 自定义组件完全依靠外部传入的props进行更新，所以可以使用memo优化
const FilterLink = memo(({name, query, lang, sort, order}) => {
	let queryString = `?query=${query}`
	if (lang) queryString += `&lang=${lang}`
	if (sort) queryString += `&sort=${sort}&order=${order||'desc'}`

	return (
		<Link href={`/search${queryString}`}>
			<a>{name}</a>
		</Link>
	)
})

function Search({router,repos}) {
	const { ...querys } = router.query
	const { lang, sort, order } = router.query

	return (
		<div className="root">
			<Row gutter={20}>
				<Col span={6}>
					<List
						bordered
						header={<span className="list-header">语言</span>}
						style={{marginBottom:20,marginTop:10}}
						dataSource={LANGUAGE}
						renderItem={item => {
							const selected = lang === item
							return (
								<List.Item key={item} style={selected? selectedItemStyle: null}>
									{ selected ? <span>{item}</span> :
										<FilterLink // 1. 自定义FilterLink组件
											{...querys}
											lang={item}
											name={item}
										/>
									}
								</List.Item>
							)
						}}
					/>
					<List
						bordered
						header={<span className="list-header">排序</span>}
						dataSource={SORT_TYPES}
						renderItem={item => {
							let selected = false
							if (item.name === 'Best Match' && !sort) {
								selected = true
							} else if (item.value === sort && item.order === order) {
								selected = true
							}
							return (
								<List.Item key={item.name} style={selected? selectedItemStyle: null}>
									{ selected ? <span>{item.name}</span> :
										<FilterLink // 1. 自定义FilterLink组件
											{...querys}
											sort={item.value}
											order={item.order}
											name={item.name}
										/>
									}
								</List.Item>
							)
						}}
					/>
				</Col>
			</Row>
			<style jsx>{`
				.root {
					padding: 20px 0;
				}
				.list-header {
					font-weight: 800;
					font-size: 16px;
				}
			`}</style>
		</div>
	)
}
```
+ 你可以看到我们做的优化的第一步，就是去掉了`handleSortChange`和`handlelanguageChange`两个组件中的函数，因为这个函数和组件中的`state`和`props`都没有关系，组件每次更新都要重新申明这个函数，这就是一种浪费

+ 同理在`a`标签的当中的匿名函数的调用，和`props`和`state`也无关，也要重新声明，所以我们也要去掉，而且本身给`a`标签添加点击事件就不太合理

+ 对于子组件`FilterLink`这个纯靠外部传入的`props`来更新的组件，就可以使用`memo`来优化，这个和`class`组件中的`shouldpropsupdated`的使用实际上同出一辙

## 搜索结果的展示
我们将给出完整的`pages/search.js`的代码，并标注相关的搜素结果展示代码的注释：
```javascript
// pages/search.js
import { withRouter } from "next/router";
import api from '../lib/api'
import { Row, Col,List, Pagination } from 'antd' // 1. 引入Pagination组件
import { memo,isValidElement } from 'react' // 2. 引入isValidElement，这个函数判断传入内容是否是合法的react组件
import Link from 'next/link'
import Repo from '../components/Repo' // 3. 引入仓库组件

const LANGUAGE = ['Javascript','HTML','CSS','Typescript','Java','Rust',]
const SORT_TYPES = [
	{ name: 'Best Match'},
	{ name: 'Most Starts', value: 'stars', order: 'desc'},
	{ name: 'Fewest Starts', value: 'stars', order: 'asc'},
	{ name: 'Most Forks', value: 'forks', order: 'desc'},
	{ name: 'Fewest Forks', value: 'forks', order: 'asc'}
]

const selectedItemStyle = {
	borderLeft: '2px solid #e36209',
	fontWeight: 100
}

function noop() {} // 4. 为Pagination组件的onChange事件定义一个空函数，我们分页的每个按钮实质是一个链接

const per_page = 20 // 5. 每页只展示20个

const FilterLink = memo(({name, query, lang, sort, order,page}) => {
	let queryString = `?query=${query}`
	if (lang) queryString += `&lang=${lang}`
	if (sort) queryString += `&sort=${sort}&order=${order||'desc'}`
	if (page) queryString += `&page=${page}` // 6.在链接上添加分页信息
	queryString += `&per_page=${per_page}`// 6.在链接上添加分页信息

	return (
		<Link href={`/search${queryString}`}>
			{/* 7.Pagination组件传入的name属性是一个a标签，所以这里要做一个判断*/}
			{isValidElement(name) ? name: <a>{name}</a>}
		</Link>
	)
})

function Search({router,repos}) {
	const { ...querys } = router.query
	const { lang, sort, order,page } = router.query

	return (
		<div className="root">
			<Row gutter={20}>
				<Col span={6}>
					<List
						bordered
						header={<span className="list-header">语言</span>}
						style={{marginBottom:20,marginTop:10}}
						dataSource={LANGUAGE}
						renderItem={item => {
							const selected = lang === item
							return (
								<List.Item key={item} style={selected? selectedItemStyle: null}>
									{ selected ? <span>{item}</span> :
										<FilterLink
											{...querys}
											lang={item}
											name={item}
										/>
									}
								</List.Item>
							)
						}}
					/>
					<List
						bordered
						header={<span className="list-header">排序</span>}
						dataSource={SORT_TYPES}
						renderItem={item => {
							let selected = false
							if (item.name === 'Best Match' && !sort) {
								selected = true
							} else if (item.value === sort && item.order === order) {
								selected = true
							}
							return (
								<List.Item key={item.name} style={selected? selectedItemStyle: null}>
									{ selected ? <span>{item.name}</span> :
										<FilterLink
											{...querys}
											sort={item.value}
											order={item.order}
											name={item.name}
										/>
									}
								</List.Item>
							)
						}}
					/>
				</Col>
				{/*8. 添加分页的代码*/}
				<Col span={18}>
					<h3 className="repos-title">{repos.total_count}</h3>
					{
						repos.items.map(repo => <Repo repo={repo} key={repo.id} />)
					}
					<div className="pagination">
						<Pagination
							pageSize={per_page}
							current={Number(page) || 1}
							total={1000} {/* 9. github限制任何搜索结果只返回1000条数据*/}
							onChange={noop}
							itemRender={(page, type ,ol) => {
								const p = type === 'page'? page: type ==='prev' ? page - 1 :page + 1
								const name = type === 'page'? page: ol
								return <FilterLink {...querys} page= {p} name={name}/>
							}}
						/>
					</div>
				</Col>
			</Row>
			<style jsx>{`
				.root {
					padding: 20px 0;
				}
				.list-header {
					font-weight: 800;
					font-size: 16px;
				}
				.repos-title {
					border-bottom: 1px solid #eee;
					font-size: 24px;
					line-height: 50px;
				}
				.pagination {
					padding: 20px;
					text-align:center;
				}
			`}</style>
		</div>
	)
}

Search.getInitialProps = async ({ctx})=> {
	const { query, sort, lang, order, page } = ctx.query

	if(!query) {
		return {
			repos: {
				total_count: 0
			}
		}
	}

	let queryString = `?q=${query}`
	if (lang) queryString += `+language:${lang}`
	if (sort) queryString += `&sort=${sort}&order=${order||'desc'}`
	if (page) queryString += `&page=${page}` // 10. 请求时携带分页信息
	queryString += `&per_page=${per_page}` // 10. 请求时携带分页信息

	const result = await api.request({
		url:`/search/repositories${queryString}`,
	},ctx.req,ctx.res)

	return {
		repos: (result && result.data)? result.data: {}
	}
}

export default withRouter(Search)
```
