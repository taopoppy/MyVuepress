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


## Issues搜索功能