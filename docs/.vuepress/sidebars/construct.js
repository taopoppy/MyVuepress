// vuepress构建网站的目录结构
module.exports = [
  '/construct/',
  {
    title: 'vuepress构站基础',
    children: [
      '/construct/vuepress_basis1',
      '/construct/vuepress_basis2'
    ]
  },
  {
    title: 'vuepress构站进阶',
    children: [
      '/construct/vuepress_advanced1',
    ]
  },
  {
    title: '计算机基础',
    children: [
      '/construct/computer_assembly_cpu',
      '/construct/computer_assembly_motherboard',
      '/construct/computer_assembly_RAM',
      '/construct/computer_assembly_graphicscard'
    ]
  },
  {
    title: '翻墙和下载加速',
    children: [
      '/construct/science_online'
    ]
  }
]