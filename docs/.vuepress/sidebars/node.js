// WeiXin
module.exports = [
  '/node/',
  {
    title: '本质与机制',
    children: [
     '/node/one_whatNode',
     '/node/one_eventLoop',
     '/node/one_betterNode'
    ]
  },
  {
    title: '模块和核心',
    children: [
      '/node/two_module_commonjs',
      '/node/two_module_introduce',
      '/node/two_module_fs',
      '/node/two_mudule_stream'
    ]
  },
  {
    title: '异步和流程',
    children: [
      '/node/three_asyncControl',
      '/node/three_asyncPreliminary',
      '/node/three_asyncDepth_promise1',
      '/node/three_asyncDepth_promise2',
      '/node/three_asyncDepth_await1',
      '/node/three_asyncDepth_await2'
    ]
  },
  {
    title: '实战和开发',
    children: [
      '/node/four_combat_introduce',
    ]
  }
]