const constructSidebar = require('./sidebars/construct')
const typescriptAxiosSidebar = require('./sidebars/typescript-axios')
const FrontendSidebar = require('./sidebars/Front-end')
const FlutterSidebar = require('./sidebars/Flutter')
const nodeRESTfulSidebar = require('./sidebars/node-RESTful')
const FullStackFriendCircleSidebar = require('./sidebars/Full-Stack-FriendCircle')
const jestSidebar = require('./sidebars/jest')
const AlgorithmSidebar = require('./sidebars/Algorithm')
const WeiXinRumenSiderbar = require('./sidebars/WeiXin-Rumen')
const WeiXinCombatSidebar = require('./sidebars/WeiXinCombat')
const WeiXinMoneySidebar = require('./sidebars/WeiXinMoney')
const nodeSidebar = require('./sidebars/node')
const nodeGraphQLSidebar = require('./sidebars/node-GraphQL')
const nodeWeiboSidebar = require('./sidebars/node-weibo')
const nodeBFFSidebar = require('./sidebars/node-BFF')
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
const reactReduxSiderbar = require('./sidebars/react-redux')
const learnMaterialsSodebar = require('./sidebars/learnMaterials')
const reactSSRSiderbar = require('./sidebars/react-ssr')
const FlutterKnowSidebar = require('./sidebars/Flutter-Know')
const reactAntdSiderbar = require('./sidebars/react-antd')
const WeiXinQuanZhanSidebar = require('./sidebars/WeiXin-Quanzhan')
const FrontadvanceSidebar = require('./sidebars/Front-advance')
const OptimizationSidebar = require('./sidebars/optimization')
const reactWebAppSiderbar = require('./sidebars/react-webapp')
const reactSourceSiderbar = require('./sidebars/react-source')
const reactTypescriptSiderbar = require('./sidebars/react-typescript')


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
      { text: '资料', link: '/learnMaterials/'},
      { text: 'github', link: 'https://github.com/taopoppy/' },
      { text: '构建网站', link: '/construct/'},
      { text: 'Flutter',
        items: [
          { text: 'Flutter入门到实战', link: '/Flutter/'},
          { text: 'Flutter知识详解', link: '/Flutter-Know/'},
        ]
      },
      //{ text: '算法世界', link: '/Algorithm/'},
      { text: '小程序',
        items: [
          { text: '微信小程序入门和实战', link: '/WeiXin-Rumen/'},
          { text: '微信小程序全栈开发实战', link: '/Weixin-quanzhan/'},
          { text: '微信小程序云开发实战', link: '/WeiXin-Combat/' },
          { text: '微信支付和分享',link: '/WeiXin-money/'}
        ]
      },
      { text: '工具系列',
        items: [
          { text: '前端自动化测试', link: '/Jest/'},
          { text: '前端工程化',link: '/Webpack/'},
          { text: '前端性能优化', link: '/Optimization/'}
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
      //     { text: 'TypeScript入门与实战', link: '/typescript/' },
      //     { text: 'TS重构axios项目开发', link: '/typescript-axios/' }
      //   ]
      // },
      {
        text: 'react',
        items: [
          // { text: 'React开发简书项目', link: '/react-junior/' },
          // { text: 'React实战大众点评WebApp', link: '/react-dazhong/'},
          // { text: 'React去哪儿网火车票PWA', link: '/react-quna/'},
          { text: 'React+Redux入门详解', link: '/react-redux/' },
          { text: 'React+TypeScript的完美结合',link: '/react-typescript/' },
          { text: 'React网易云Webapp', link: '/react-webapp/'},
          { text: 'React服务器渲染原理解析', link: '/react-ssr/'},
          { text: 'React深度剖析和源码解析', link: '/react-source/' },
          { text: 'React+Typescript开发组件库', link: '/react-antd/'}
          // { text: 'React+Next.js+Koa2', link: '/react-next/' },
          // { text: 'React源码深度解析', link: '/react-yuanma/'}
        ]
      },
      {
        text: 'vue',
        items: [
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
          { text: '前端初级面试', link: '/Front-end/' },
          { text: '前端中级面试', link: '/Front-advance/'}
        ]
      },
      // {
      //   text: '前端面试',
      //   items: [
      //     { text: '深入浅区块链',link: '/blockchain/'},
      //     { text: 'Node+React开发区块链', link:'/node-blockchain/'}
      //   ]
      // }
    ],
    sidebarDepth: 3,
    lastUpdated: 'Last Updated', // string | boolean
    sidebar: {
      '/construct/': constructSidebar,
      '/Algorithm/': AlgorithmSidebar,
      '/Flutter/': FlutterSidebar,
      '/Flutter-Know/': FlutterKnowSidebar,
      '/node-RESTful/': nodeRESTfulSidebar,
      '/node-weibo/':nodeWeiboSidebar,
      '/node-BFF/': nodeBFFSidebar,
      '/Jest/': jestSidebar,
      '/vue-ssr/':vueSSRSidebar,
      '/vue-interview/': vueInterviewSidebar,
      '/Webpack/': WebpackSidebar,
      '/typescript-axios/': typescriptAxiosSidebar,
      '/Front-end/': FrontendSidebar,
      '/Front-advance/': FrontadvanceSidebar,
      '/Optimization/':OptimizationSidebar,
      '/Full-Stack-FriendCircle/': FullStackFriendCircleSidebar,
      '/WeiXin-Rumen/':WeiXinRumenSiderbar,
      '/WeiXin-Combat/': WeiXinCombatSidebar,
      '/WeiXin-money/': WeiXinMoneySidebar,
      '/Weixin-quanzhan/': WeiXinQuanZhanSidebar,
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
      '/learnMaterials/': learnMaterialsSodebar,
      '/react-redux/': reactReduxSiderbar,
      '/react-ssr/':reactSSRSiderbar,
      '/react-antd/': reactAntdSiderbar,
      '/react-webapp/': reactWebAppSiderbar,
      '/react-source/': reactSourceSiderbar,
      '/react-typescript/': reactTypescriptSiderbar
    }
  }
}