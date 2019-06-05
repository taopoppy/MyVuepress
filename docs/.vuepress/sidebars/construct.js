// vuepress构建网站的目录结构
module.exports = [
  '/construct/',
  {
    title: 'vuepress构站基础',
    children: [
      '/construct/vuepress_basis/vuepress_basis1',
      '/construct/vuepress_basis/vuepress_basis2'
    ]
  },
  {
    title: 'vuepress构站进阶',
    children: [
      '/construct/vuepress_basis1',
    ]
  }
]