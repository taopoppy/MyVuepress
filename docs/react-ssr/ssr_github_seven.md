# 仓库-Issues页面
+ <font color=#9400D3>GET /repos/:owner/:repo/issues
</font>：根据owner和repo来获取仓库Issues信息（[List repository issues](https://developer.github.com/v3/issues/#list-repository-issues)))）

+ <font color=#9400D3>GET /search/users
</font>：查询用户（[Search users](https://developer.github.com/v3/search/#search-users)))）

## Issues页面的开发
```javascript
// pages/details/issues.js
import withRepoBasic from '../../components/with-repo-basic'
import { Avatar, Button } from 'antd'
import api from '../../lib/api'
import { useState,useCallback } from 'react'
import dynamic from 'next/dynamic'
import { getLastUpdated } from '../../lib/utils'

const MdRenderer = dynamic(()=> import('../../components/MarkdownRenderer'))

// issue具体信息的组件
function IssueDetail({ issue }) {
	return (
		<div className="root">
			<MdRenderer content={issue.body}/>
			<div className="actions">
				<Button href={issue.html_url} target="_blank">打开Issues讨论页面</Button>
			</div>
			<style jsx>{`
				.root {
					background: #fefefe;
					padding: 20px;
				}
				.actions {
					text-align: right;
				}
			`}</style>
		</div>
	)
}


// 每个issue组件
function IssueItem({issue}) {
	const [showDetail, setShowDetail] = useState(false)

	const toggleShowDetail = useCallback(() => {
		// 重点：使用useCallback的方式更新state,不依赖setShowDetail,逃过了闭包
		setShowDetail(detail => !detail)
	},[])

	return (
		<div>
			<div className="issue">
				<Button
					type="primary"
					size="small"
					style={{position: 'absolute',right:10,top:10}}
					onClick={toggleShowDetail}
				>
					{ showDetail ? '隐藏': '查看' }
				</Button>
				<div className="avatar">
					<Avatar src={issue.user.avatar_url} shape="square" size={50}/>
				</div>
				<div className="main-info">
					<h6>
						<span>{issue.title}</span>
					</h6>
					<p className="sub-info">
						<span>Updated at {getLastUpdated(issue.updated_at)}</span>
					</p>
				</div>
				<style jsx>{`
					.issue {
						display: flex;
						position: relative;
						padding: 10px;
					}
					.issue:hover {
						background: #fafafa;
					}
					.issue + .issue {
						border-top: 1px solid #eee;
					}
					.main-info > h6 {
						max-width: 600px;
						font-size: 16px;
						padding-right: 40px;
					}
					.avatar {
						margin-right: 20px;
					}
					.sub-info {
						margin-bottom: 0;
					}
					.sub-info> span + span {
						display: inline-block;
						margin-left: 20px;
						font-size: 12px;
					}
				`}</style>
			</div>
		{ showDetail? <IssueDetail issue={issue}/>: null}
		</div>
	)
}

function Issues({issues}){
	return (
		<div className="root">
			<div className="issues">
				{
					issues.map(issue=> <IssueItem issue={issue} key={issue.id} />)
				}
			</div>
			<style jsx>{`
				.issues {
					border: 1px solid #eee;
					border-radius: 5px;
					margin-bottom:20px;
					margin-top:20px;
				}
			`}</style>
		</div>
	)
}

Issues.getInitialProps = async ({ctx}) => {
	const { owner,name } = ctx.query

	const issuesResp = await api.request({
		url: `/repos/${owner}/${name}/issues`
	},ctx.req, ctx.res)

	return {
		issues: issuesResp.data
	}

}

export default withRepoBasic(Issues,'issues')
```
上述代码除了使用`useCallback`来优化的部分你需要好好理解，其他的不需要多研究，都是布局和样式的代码。我们看一下初步实现效果：

<img :src="$withBase('/react_ssr_github_issues_pages.png')" alt="issues页面">

## 创建用户搜素组件
关于搜索的组件，我们之前在导航栏中做的那个搜索是比较贴近`ToB`，也就是面向用户，下面的这个搜索我们将采用一种中后台的方式去解决.

首先在[https://developer.github.com/v3/issues/#list-repository-issues](https://developer.github.com/v3/issues/#list-repository-issues)当中可以看到有很多`Parameters`，这些`Parameters`可以帮助我们进行删选，当然我们不会所有的都用，其中`state`、`creator`、`labels`是我们关注的几个比较重要的搜索条件
，关于用户的搜索组件，我们希望在输入的时候，可以去请求`github`，给我们一个`github`已存在和你输入相似的用户名称列表，然后显示在下拉框中，我们就来创建这样一个组件：
```javascript
// components/SearchUser.jsx
import { useState,useCallback,useRef } from 'react'
import { Select,Spin } from 'antd' // 1. 引入Select组件
import api from '../lib/api'
import debounce from 'lodash/debounce'

// 2. 创建选择器的下拉组件
const Option = Select.Option

// 10.外部传入的获取value的onChange方法
function SearchUser({onChange,value}) {
	const lastFetchIdRef = useRef(0) // 7. {current: 0}这样一个对象
	const [ fetching, setFetching ] = useState(false)
	const [ options, setOptions ] = useState([])

	// 4. fetchUser不依赖fetching和options，只依赖他们对应的修改方法，所以第二个参数不用传
	// 4. 使用debounce在用户输入反馈超过500毫秒才去执行，否则每输入一个字母都要请求数据
	const fetchUser = useCallback(debounce(value => {
		lastFetchIdRef.current += 1
		const fetchId = lastFetchIdRef.current

		setFetching(true)
		setOptions([])

		api.request({
			url: `/search/users?q=${value}`
		}) // 5. 这里不需要传递ctx.req和ctx.res，因为一定是在浏览器中用户点击才会触发的
		.then(resp => {
			// 6. 这里说明一下，因为每次请求的时候是异步的，所以当网速比较慢的时候，在请求的过程中有可能
			// 6. 又发了一个新的请求，所以要把每次闭包中的fetchId和lastFetchIdRef.current进行对比
			// 6. 如果不一样，说明第一次请求还没返回的时候又有了新请求，此时的第一次的请求就可以废弃
			if (fetchId !== lastFetchIdRef.current) {
				return
			}
			const data = resp.data.items.map(user => ({
				text: user.login,
				value: user.login
			}))

			setFetching(false)
			setOptions(data)
		})
	}, 500),[])

	// 9. 你在给出的下拉选择列表中选择了某个value
	const handleChange = (value) => {
		setOptions([])
		setFetching(false)
		onChange(value)
	}

	return (
		<Select
			style={{ width:200 }}
			showSearch={true}
			notFoundContent={fetching ? <Spin size="small" />: <span>nothing</span>}
			filterOption={false}
			placeholder="创建者"
			allowClear={true}
			value={value} // 11. 外部传入的value要显示在这里
			onChange={handleChange}  // 8. 在下拉框中选择了某个数据
			onSearch={fetchUser} // 3. 输入的时候请求服务端的数据
		>
			{
				// 2.1 下拉展示的部分
				options.map(op => (
					<Option value={op.value} key={op.value}>{op.text}</Option>
				))
			}
		</Select>
	)
}

export default SearchUser
```
## Issues搜索功能
```javascript
// 
import withRepoBasic from '../../components/with-repo-basic'
import { Avatar, Button, Select, Spin } from 'antd'
import api from '../../lib/api'
import { useState,useCallback,useEffect } from 'react'
import dynamic from 'next/dynamic'
import { getLastUpdated } from '../../lib/utils'
import SearchUser from '../../components/SearchUser' // 1. 引入SearchUser组件

const MdRenderer = dynamic(()=> import('../../components/MarkdownRenderer'))

// 12. 声明缓存labels的对象
const CACHE = {}

function IssueDetail({ issue }) {
	return (
		<div className="root">
			<MdRenderer content={issue.body}/>
			<div className="actions">
				<Button href={issue.html_url} target="_blank">打开Issues讨论页面</Button>
			</div>
			<style jsx>{`
				.root {
					background: #fefefe;
					padding: 20px;
				}
				.actions {
					text-align: right;
				}
			`}</style>
		</div>
	)
}

function IssueItem({issue}) {
	const [showDetail, setShowDetail] = useState(false)

	const toggleShowDetail = useCallback(() => {
		// 重点：使用useCallback的方式更新state,不依赖setShowDetail,逃过了闭包
		setShowDetail(detail => !detail)
	},[])

	return (
		<div>
			<div className="issue">
				<Button
					type="primary"
					size="small"
					style={{position: 'absolute',right:10,top:10}}
					onClick={toggleShowDetail}
				>
					{ showDetail ? '隐藏': '查看' }
				</Button>
				<div className="avatar">
					<Avatar src={issue.user.avatar_url} shape="square" size={50}/>
				</div>
				<div className="main-info">
					<h6>
						<span>{issue.title}</span>
						{
							//11. 使用Label的样式，在标题上显示Label
							issue.labels.map(label => {
								<Label label={label} key={label.id}/>
							})
						}
					</h6>
					<p className="sub-info">
						<span>Updated at {getLastUpdated(issue.updated_at)}</span>
					</p>
				</div>
				<style jsx>{`
					.issue {
						display: flex;
						position: relative;
						padding: 10px;
					}
					.issue:hover {
						background: #fafafa;
					}
					.issue + .issue {
						border-top: 1px solid #eee;
					}
					.main-info > h6 {
						max-width: 600px;
						font-size: 16px;
						padding-right: 40px;
					}
					.avatar {
						margin-right: 20px;
					}
					.sub-info {
						margin-bottom: 0;
					}
					.sub-info> span + span {
						display: inline-block;
						margin-left: 20px;
						font-size: 12px;
					}
				`}</style>
			</div>
		{ showDetail? <IssueDetail issue={issue}/>: null}
		</div>
	)
}


// 10. 给label添加显示样式
function Label({ label }) {
	return (
		<>
			<span className="label" style={{backgroundColor:`#${label.color}`}}>{label.name}</span>
			<style jsx>{`
				.label {
					display: inline-block;
					line-height: 20px;
					margin-left: 15px;
					padding: 3px 10px;
					border-radius:3px;
					font-size: 14px;
				}
			`}</style>
		</>
	)
}


const Option = Select.Option

// 9. 拼装query的方法
function makeQuery(creator, state, labels) {
	let creatorStr = creator? `creator=${creator}`:''
	let stateStr = state? `state=${state}`:''
	let labelsStr = ''
	if (labels && labels.length > 0) {
		labelsStr = `labels=${labels.join(',')}`
	}
	const arr = []
	if (creatorStr) arr.push(creatorStr)
	if (stateStr) arr.push(stateStr)
	if (labelsStr) arr.push(labelsStr)

	return `?${arr.join('&')}`
}

const isServer = typeof window === 'undefined'
function Issues({initialIssues, labels, owner, name}){
	const [creator, setCreator ] = useState() // 查询条件creator
	const [state, setState ] = useState() 		// 查询条件state
	const [label, setLabel] = useState([])	  // 查询条件label

	const [issues, setIssues] = useState(initialIssues) // issues搜索结果数组

	const [fetching, setFetching] = useState(false) // 动画

	// 13. 缓存Labels
	useEffect(()=> {
		if(!isServer){
			CACHE[`${owner}/${name}`] = labels
		}
	},[labels,name,owner])


	const handleCreatorChange = useCallback((value) => {
		setCreator(value)
	}, [])

	const handleStateChange = useCallback((value) => {
		setState(value)
	}, [])

	const handleLabelChange = useCallback((value) => {
		setLabel(value)
	}, [])

	// 8. 搜索按钮的点击事件
	const handleSearch = useCallback(() => {
		setFetching(true)
		api.request({
			url: `/repos/${owner}/${name}/issues${makeQuery(creator,state,label)}`,
		})
		.then(resp => {
			setIssues(resp.data)
			setFetching(false)
		})
		.catch(err=> {
			console.error(err)
			setFetching(false)
		})
	},[owner,name,creator,state,label])


	return (
		<div className="root">
			<div className="search">
				{/* 2.  用户搜索 */}
				<SearchUser onChange={handleCreatorChange} value={creator} />

				{/* 3.Issues状态搜索 */}
				<Select
					placeholder="状态"
					onChange={handleStateChange}
					value={state}
					style={{width:200,marginLeft:20}}
				>
					<Option value="all">all</Option>
					<Option value="open">open</Option>
					<Option value="closed">closed</Option>
				</Select>

				{/* 4. 仓库labels搜索 */}
				<Select
					mode="multiple"
					placeholder="Label"
					onChange={handleLabelChange}
					value={label}
					style={{flexGrow: 1,marginLeft:20, marginRight: 20}}
				>
					{
						labels.map(la => {<Option value={la.name} key={la.id}>{la.name}</Option>})
					}
				</Select>
				{/* 7. 搜索的按钮 */}
				<Button type="primary" onClick={handleSearch} disabled={fetching}>搜索</Button>
			</div>

			{
				fetching ? <div className="loading"><Spin /></div> :
				<div className="issues">
					{
						issues.map(issue=> <IssueItem issue={issue} key={issue.id} />)
					}
				</div>
			}
			<style jsx>{`
				.issues {
					border: 1px solid #eee;
					border-radius: 5px;
					margin-bottom:20px;
					margin-top:20px;
				}
				.search {
					display: flex;
				}
				.loading {
					height: 400px;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			`}</style>
		</div>
	)
}

Issues.getInitialProps = async ({ctx}) => {
	const { owner,name } = ctx.query

	const full_name = `${owner}/${name}`

	const fetchs = await Promise.all([
		// 获取仓库所有的issues
		await api.request({
			url: `/repos/${owner}/${name}/issues`
		},ctx.req, ctx.res),

		// 5. 获取仓库所有的label
		// 6. 获取labels的数据应该和issues数据是并发请求的，所以都放在Promise.all中
		// 14. 使用labels的缓存对象
		CACHE[full_name]? Promise.resolve({data:CACHE[full_name]}) :
		await api.request({
			url: `/repos/${owner}/${name}/labels`
		},ctx.req, ctx.res)
	])

	return {
		initialIssues: fetchs[0].data,
		labels: fetchs[1].data,
		owner,
		name
	}
}

export default withRepoBasic(Issues,'issues')
```
关于`Issues`页面的内容很多，但是都是我们前面实现类似功能的一个集合