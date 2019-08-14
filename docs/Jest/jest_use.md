# jest的使用

## jest修改测试化样例
首先我们需要在项目中去安装`jest`
```bash
npm install jest@24.8.0 -save-dev
```

然后我们在`math.js`文件中写了三个方法,并将它们导出，因为要导出进行测试
```javascript
function add(a, b) {
  return a + b
}

function minus(a, b) {
  return a - b
}

function multi(a, b) {
  return a * b
}

try {
  module.exports = {
    add,
    minus,
    multi
  }
} catch (error) {}
```
然后我们创建`math.jest.js`作为测试文件，一般来说就是测试`math.js`文件中的内容：
```javascript
const {add, minus, multi} = require('./math')

test('测试加法 3 + 7',() => {
  expect(add(3,7)).toBe(10)
})

test('测试减法 3 - 3 ',() => {
  expect(minus(3,3)).toBe(0)
})
test('测试乘法 3 * 3',() => {
  expect(multi(3,3)).toBe(9)
})
```
上述测试文件中的`expect`,`test`方法都不用自己定义，因为我们在项目中下载了，接着我们在`package.json`文件中定义测试的命令
```javascript
"test": "jest --watchAll"
```
这个命令的意思就是在当前所在目录下去找以`.test.js`结尾的文件，然后执行，参数`--watchAll`就是监听所有测试文件的变化，只要有变化，我们就自动重新测试，比如我们上述结果的执行结果如下
```javascript
 PASS  ./math.test.js
  √ 测试加法 3 + 7 (7ms)
  √ 测试减法 3 - 3  (1ms)
  √ 测试乘法 3 * 3

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        12.19s
Ran all test suites.
```
现在我们可以知道<font color=#3eaf7c>使用jest做单元测试相当于模块测试，做集成测试就是多个模块一起测试</font>，那么问题来了，在`js`文件中使用`commonjs`风格对代码模块化，我们在`index.html`中就识别不了`module`,没法在浏览器中运行了,所以我们在`math.js`文件中导出的语句是按照`try catch`去编写的，这样浏览器运行就吞噬掉了错误，而测试环境下是`node`环境，不会报错。但是在实际的项目中我们没有必要这样写，因为项目中都是按照模块化的风格去写代码的。

## jest的简单配置
从上面可以看出我们并没有对`jest`做什么配置，是因为`jest`本身有默认的配置，我们现在要去简单修改配置，怎么做？我们首先在项目下面运行命令：
```bash
npx jest --init
```
这个命令就是我们使用`node_modules`中的`jest`模块的命令来初始化一个`jest.config.js`的文件，期间会问你三个问题：
+ `Choose the test enviroment that will be used for testing`(询问你当前项目是`node`项目还是`brower`项目)：选择`browser-Like`
+ `Do you want Jest to add coverage reports`(是否生成代码覆盖率报告)：yes
+ `Automatically clear mock calls and instance betwween evert test`(在每次测试完毕后清除模拟调用这个事情):yes

那么生成的`jest.config.js`文件中有很多选项，除了上述三个选择其他都是注释项

### coverageDirectory
在`jest.config.js`文件中有个`coverageDirectory:"coverage"`的设置，这个设置有两个含义
+ 通过`npx jest --coverage`这个命令可以在控制台中生成覆盖率的报告
+ 同时在项目目录中生成`coverage`目录，这个目录的名称就是设置项中`coverageDirectory`的值，在这个目录下面的`lcov-report`目录中有个`index.html`这个页面智能的显示了测试覆盖率的信息。

### babel转化
我们知道在`jest`测试的时候处于`node`环境，所以默认是支持`commonJS`的模块导入导出语法的，但是不支持`ESmodule`模块的导入导出语法的，所以我们使用<font color=#3eaf7c>Babel</font>来解决这个问题，先安装`babel`
```bash
npm install @babel/core@7.4.5 @babel/preset-env@7.4.5 -D
```
然后我们在项目目录下创建`.babelrc`文件去配置一下`babel`
```javascript
{
  "presets": [
    [
      "@babel/preset-env", {
        "targets": {
          "node":"current"
        }
      }
    ]
  ]
}
```
这样配置之后，我们测试之前`babel`就能将我们写的`ESmodule`模块导入导出语法转化成为`CommonJs`模块导出导出语法
