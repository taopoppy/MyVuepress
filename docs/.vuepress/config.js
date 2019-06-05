const constructSidebar = require('./sidebars/construct')
module.exports = {
  title: 'VuePress',
  description: '陶振川',
  head: [
    ['link', { rel: 'icon', href: '/meta.png' }]    // 配置html页面meta的图标
  ],
  plugins: ['@vuepress/back-to-top'],               //  配置回到顶部的插件
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'github', link: 'https://github.com/taopoppy/' },
      { text: '构建网站', link: '/construct/'},
      {
        text: 'language',
        items: [
          { text: 'javascript', link: '/javascript/' },
          { text: 'typescript', link: '/typescript/' }
        ]
      },
      // 下来列表产生分组
      {
        text: '学习',
        items: [
          {
            text: '前端',
            items: [
              { text: 'language', link: '/language/' },
              { text: 'react', link: '/react/' }
            ]
          },
          {
            text: '后端',
            items: [
              { text: 'node', link: '/language/chinese' },
              { text: 'Go', link: '/language/japanese' }
            ]
          }
        ]
      }
    ],
    sidebarDepth: 3,
    lastUpdated: 'Last Updated', // string | boolean
    sidebar: {
      '/construct/':constructSidebar,
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
      ],
      '/language/':[
        '/language/', // 这个就是language文件夹下面额README.md文件。不是下拉的格式
        {
          title:'js&ts',
          children: [
            '/language/javascript', //以docs为根目录来查找文件
            '/language/typescript'
          ]
        }
      ]
    }
  }
}