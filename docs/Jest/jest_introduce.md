# 前端自动化测试简介

## 背景及原理
前端最常见的3中自动化测试的方法：<font color=#3eaf7c>单元测试</font>、<font color=#3eaf7c>集成测试</font>、<font color=#3eaf7c>end-to-end(端到端测试)</font>

我们希望有这样一种写法来帮助我们测试结果，比如说我们已经有`add`和`minus`两个函数，我们希望这样测试：
```javascript
test("测试加法 3 + 7",()=> {
  expect(add(3,7)).toBe(10)
})
```
那么我们就需要这样来编写`test`函数和`expect`函数
```javascript
function expect(result) {
  return {
    toBe: function(actual) {
      if(result !== actual) {
        throw new Error(`预期值和实际值不一样，预期是${actual}，结果是${result}`,)
      }
    }
  }
}

function test(decs,fn) {
  try {
    fn()
    console.log(`${desc}通过测试`)
  } catch (error) {
    console.log(`${desc}没有通过测试 ${error}`)
  }
}
```
所以前端自动化是什么?前端自动化就是<font color=#3eaf7c>实际就是我们写的js测试代码，通过对比预期值和实际值来判断代码的正确性</font> 

## 测试框架
前端自动化测试库有很多：`Jasmine`，`MOCHA`,`Jest`,那么我们这次使用的就是`Jest`，因为在性能、功能和易用性表现的比较好，实际上其他测试库也不差，底层原理都差不多，学会一门通所有，我们下面说说`Jest`的优点： 
+ <font color=#CC99CD>速度快</font>：没有修改的代码是不会重新运行测试代码的
+ <font color=#CC99CD>API简单</font>：数量少，容易学
+ <font color=#CC99CD>易配置</font>：通过配置文件简单配置
+ <font color=#CC99CD>隔离性好</font>：测试文件之间相互隔离
+ <font color=#CC99CD>监控模式</font>：更灵活的运行测试用例
+ <font color=#CC99CD>IDE整合</font>：容易合IDE做整合
+ <font color=#CC99CD>Snaphot</font>：快速解决不重要的测试
+ <font color=#CC99CD>多项目并行</font>：同时测试node和vue的测试用例
+ <font color=#CC99CD>覆盖率</font>：通过简单的命令即可生成报告
+ <font color=#CC99CD>MOCK丰富</font>：提供很多Mock机制
+ <font color=#CC99CD>支持新型技术</font>：比如`Babel`,`typescript`,`node`等等
+ <font color=#CC99CD>插件丰富</font>：在`vue`中结合`Vue-test-utils`对组件进行测试，在`react`中结合`Enzyme`对组件测试