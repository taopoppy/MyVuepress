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
