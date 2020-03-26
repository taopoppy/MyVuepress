const constructSidebar = require('./sidebars/construct')
const typescriptSidebar = require('./sidebars/typescript')
const typescriptAxiosSidebar = require('./sidebars/typescript-axios')
const FrontendSidebar = require('./sidebars/Front-end')
const typescriptAxiosFontSidebar = require('./sidebars/typescript-axios-font')
const FlutterSidebar = require('./sidebars/Flutter')
const nodeRESTfulSidebar = require('./sidebars/node-RESTful')
const FullStackFriendCircleSidebar = require('./sidebars/Full-Stack-FriendCircle')
const jestSidebar = require('./sidebars/jest')
const AlgorithmSidebar = require('./sidebars/Algorithm')
const WeiXinSidebar = require('./sidebars/WeiXin')
const WeiXinCombatSidebar = require('./sidebars/WeiXinCombat')
const nodeSidebar = require('./sidebars/node')
const nodeGraphQLSidebar = require('./sidebars/node-GraphQL')
const nodeWeiboSidebar = require('./sidebars/node-weibo')
const nodeBFFSidebar = require('./sidebars/node-BFF')
const reactJinJieSidebar = require('./sidebars/react-jinjie')
const vueShiZhanSidebar = require('./sidebars/vue-shizhan')
const WebpackSidebar = require('./sidebars/Webpack')
const vueSSRSidebar = require('./sidebars/vue-ssr')
const goSidebar = require('./sidebars/go')
const BeegoSidebar = require('./sidebars/Beego')
const goConcurrentSiderbar = require('./sidebars/go-concurrent')
const goWebSidebar = require('./sidebars/go-web')
const mysqlSidebar = require('./sidebars/Mysql')
const protocolSidebar = require('./sidebars/protocol')
const goReptileSidebar = require('./sidebars/go-reptile')
const linuxSidebar = require('./sidebars/Linux')
const prometheusSidebar = require('./sidebars/prometheus')
const blockchainSidebar = require('./sidebars/blockchain')
const nodeBlockchainSidebar = require('./sidebars/nodeblockchain')
const vueInterviewSidebar = require('./sidebars/vueInterview')

module.exports = {
  title: 'TaoPoppy',
  description: '陶振川',
  head: [
    ['link', { rel: 'icon', href: '/meta.png' }]    // 配置html页面meta的图标
  ],
  plugins: ['@vuepress/back-to-top'],               //  配置回到顶部的插件
  // markdown: {
  //   config: md => {
  //     md.use(require('markdown-it-xxx'))
  //   }
  // },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'github', link: 'https://github.com/taopoppy/' },
      { text: '构建网站', link: '/construct/'},
      //{ text: 'Flutter', link: '/Flutter/'},
      //{ text: '算法世界', link: '/Algorithm/'},
      // { text: '小程序',
      //   items: [
      //     { text: '微信小程序入门和云开发', link: '/WeiXin/' },
      //     { text: '微信小程序云开发实战', link: '/WeiXin-Combat/' }
      //   ]
      // },
      { text: '工具系列',
        items: [
          { text: 'Jest', link: '/Jest/'},
          { text: 'Webpack',link: '/Webpack/'}
        ]
      },
      // {
      //   text: '全栈',
      //   items: [
      //     { text: '朋友圈', link: '/Full-Stack-FriendCircle/'}
      //   ]
      // },
      {
        text: 'Go',
        items: [
          { text: 'go语言入门实践', link: '/go/' },
          { text: 'go并发编程详解', link: '/go-concurrent/' },
          { text: 'go与web编程实战', link: '/go-web/' },
          { text: 'go爬虫编程实战', link: '/go-reptile/' },
          { text: 'Beego框架入门', link: '/Beego/' }
        ]
      },
      {
        text: 'node',
        items: [
          { text: 'node入门', link: '/node/' },
          { text: 'node与RESTful', link: '/node-RESTful/' },
          { text: 'node与GraphQL', link: '/node-GraphQL/'},
          { text: 'node与BFF', link: '/node-BFF/'},
          { text: 'node博客后台', link: '/node-blog/' },
          { text: 'node实战微博', link: '/node-weibo/'},
          { text: 'node微服务',link: '/node-microService/'}
        ]
      },
      // {
      //   text: 'TS系列',
      //   items: [
      //     { text: 'TypeScript入门', link: '/typescript/' },
      //     { text: 'TS重构axios前置学习', link: '/typescript-axios-font/' },
      //     { text: 'TS重构axios项目开发', link: '/typescript-axios/' }
      //   ]
      // },
      {
        text: 'react',
        items: [
          // { text: 'React实战进阶', link: '/react-jinjie/'},
          // { text: 'React开发简书项目', link: '/react-junior/' },
          // { text: 'React实战大众点评WebApp', link: '/react-dazhong/'},
          // { text: 'React去哪儿网火车票PWA', link: '/react-quna/'},
          { text: 'React服务器渲染原理解析', link: '/react-ssr/'},
          // { text: 'React+Next.js+Koa2', link: '/react-next/' },
          // { text: 'React源码深度解析', link: '/react-yuanma/'}
        ]
      },
      {
        text: 'vue',
        items: [
          // { text: 'Vue开发实战', link: '/vue-shizhan/' },
          // { text: 'Vue2.5开发去哪儿网App', link: '/vue-quna/'},
          // { text: 'Get全栈技能打造商城系统', link: '/vue-shagncheng/' },
          // { text: 'Vue 实战商业级读书WebApp', link: '/vue-dushu/'},
          { text: 'Vue服务端渲染原理解析', link: '/vue-ssr/' },
          { text: 'Vue面试指南', link: '/vue-interview/'}
          // { text: 'Vue全家桶+SSR+Koa2', link: '/vue-nuxt/' },
          // { text: 'Vue.js源码全方位深入解析', link: '/vue-yuanma/' }
        ]
      },
      {
        text: '后端系列',
        items: [
          {
            text: '数据库',
            items: [
              { text: 'mysql', link: '/Mysql/' },
              { text: 'mysql-Architecture', link: '/Mysql-Architecture/'}
            ]
          },
          {
            text: 'linux操作系统',
            items: [
              { text: 'linux', link: '/Linux/' },
              { text: 'linux-Architecture', link: '/Linux-Architecture/'}
            ]
          },
          {
            text: '网络协议',
            items: [
              { text: 'protocol', link: '/Protocol/' },
              { text: 'font-end-protocol', link: 'font-end-protocol' }
            ]
          },
          {
            text:'运维系统',
            items: [
              { text: 'prometheus',link: '/prometheus/'}
            ]
          }
        ]
      },
      {
        text: '前端系列',
        items: [
          { text: '前端架构', link: '/Front-end/' },
        ]
      },
      {
        text: '区块链',
        items: [
          { text: '深入浅区块链',link: '/blockchain/'},
          { text: 'Node+React开发区块链', link:'/node-blockchain/'}
        ]
      }
    ],
    sidebarDepth: 3,
    lastUpdated: 'Last Updated', // string | boolean
    sidebar: {
      '/construct/': constructSidebar,
      '/Algorithm/': AlgorithmSidebar,
      '/Flutter/': FlutterSidebar,
      '/node-RESTful/': nodeRESTfulSidebar,
      '/node-weibo/':nodeWeiboSidebar,
      '/node-BFF/': nodeBFFSidebar,
      '/typescript/': typescriptSidebar,
      '/Jest/': jestSidebar,
      '/vue-ssr/':vueSSRSidebar,
      '/vue-interview/': vueInterviewSidebar,
      '/Webpack/': WebpackSidebar,
      '/react-jinjie/': reactJinJieSidebar,
      '/vue-shizhan/': vueShiZhanSidebar,
      '/typescript-axios/': typescriptAxiosSidebar,
      '/typescript-axios-font/':typescriptAxiosFontSidebar,
      '/Front-end/': FrontendSidebar,
      '/Full-Stack-FriendCircle/': FullStackFriendCircleSidebar,
      '/WeiXin/':WeiXinSidebar,
      '/WeiXin-Combat/': WeiXinCombatSidebar,
      '/node/': nodeSidebar,
      '/go/': goSidebar,
      '/blockchain/': blockchainSidebar,
      '/node-blockchain/': nodeBlockchainSidebar,
      '/Linux/': linuxSidebar,
      '/go-reptile/': goReptileSidebar,
      '/Mysql/': mysqlSidebar,
      '/Protocol/': protocolSidebar,
      '/prometheus/': prometheusSidebar,
      '/go-web/': goWebSidebar,
      '/go-concurrent/': goConcurrentSiderbar,
      '/Beego/': BeegoSidebar,
      '/node-GraphQL/': nodeGraphQLSidebar,
      '/react/':[
        '/react/',   // 这个就是react文件夹下面额README.md文件。不是下拉的格式
        {
          title: 'react',
          children: [
            '/react/react1',
            '/react/react2'
          ]
        },
        {
          title: 'vue',
          children:[
            '/react/vue1',
            '/react/vue2'
          ]
        }
      ]
    }
  }
}