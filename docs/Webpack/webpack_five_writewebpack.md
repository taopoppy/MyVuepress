# Bundler源码编写

## 模块分析
`webpack`打包的时候要做的两个重要的事情分别是: <font color=#DD1144>模块分析</font>和<font color=#DD1144>模块打包</font>，模块分析是什么：
+ <font color=#3eaf7c>分析路径</font>：<font color=#1E90FF>指的是对于模块文件中引入的其他模块做路径分析，以便于根据此路径去做其他模块的分析</font>
+ <font color=#3eaf7c>代码转换</font>：<font color=#1E90FF>指的是利用babel将代码转换成为浏览器能运行的代码</font>

然后我们废话不多说，直接上代码，然后用图示来告诉你单个模块是怎么分析的
```javascript
const fs = require('fs');
const path = require('path')
const paser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core')

const moduleAnalayser = (filename) =>{
	const content = fs.readFileSync(filename,'utf-8')
	// 抽象语法树（路径分析）
	const ast= paser.parse(content,{
		sourceType: 'module'
	});

	const dependencies ={} // 保存所有引入模块的打包路径

	// 遍历抽象语法树（路径分析）
	traverse(ast, {
		ImportDeclaration({node}) {
			const dirname = path.dirname(filename)  // ./src
			const newFile = './' + path.join(dirname,node.source.value)
			dependencies[node.source.value] = newFile
		}
	})
  // 将抽象语法树编译成为浏览器可以运行的代码（代码转换）
	const { code } = babel.transformFromAst(ast,null, {
		presets: ["@babel/preset-env"]
	})

	return {
		filename,
		dependencies,
		code
	}
}

const moduleInfo = moduleAnalayser('./src/index.js')
console.log(moduleInfo)
```
<img :src="$withBase('/webpack_five_module_analysize.png')" alt="单个模块分析过程">

+ 分析`index.js`模块分析首先要利用`fs`库读取文件的内容`content`
+ 利用`@babel/parser`库将`content`读取为抽象语法树`ast`
+ 利用`@babel/traverse`库分析出`index.js`中引入其他模块的绝对路径或者相对于`bundle.js`的路径集合（图示有误，见谅）
+ 利用`@babel/core`库和`@babel/preset-env`库将抽象语法树`ast`转化为浏览器可运行的代码`code`
+ 最后将<font color=#1E90FF>本模块的名称</font>和<font color=#1E90FF>引入模块路径集合</font>和<font color=#1E90FF>可运行代码</font>三者返回

所以我们最终打印出分析一个模块返回的结果：
```javascript
{
  filename: './src/index.js',
  dependencies: { './message.js': './src\\message.js' },
  code: '"use strict";\n' +
    '\n' +
    'var _message = _interopRequireDefault(require("./message.js"));\n' +
    '\n' +
    'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj
: { "default": obj }; }\n' +
    '\n' +
    'console.log(_message["default"]);'
}
```
可以清楚的看到：<font color=#3eaf7c>filename</font>是这个模块的路径，<font color=#3eaf7c>dependencies</font>是这个模块引入其他模块的路径集合，<font color=#3eaf7c>code</font>就是分析该模块后的浏览器可执行的代码。

## Dependencies Graph
我们上面是对单个文件进行代码分析，按照我们使用`webpack`的经验来说，它会递归或者循环的去将每个模块的引入模块都做代码分析，一层一层的分析，所以需要写一个递归函数，递归的对每个引入的模块都做一层代码分析：
```javascript
// bundle.js
// 递归的去分析所有依赖的模块
const makeDependenciesGraph = (entry) => {
	// 分析入口文件
	const entryModule = moduleAnalayser(entry)
	// 创建递归的数组
	const graphArray = [ entryModule ]
	// 循环遍历数组
	for (let i = 0; i < graphArray.length; i++) {
		const item = graphArray[i];
		const { dependencies } = item
		// 对模块的依赖继续循环做代码分析
		if(dependencies) {
			for(let j in dependencies) {
				graphArray.push(
					moduleAnalayser(dependencies[j])
				)
			}
		}
	}
	// 调整一下数据结构
	const graph = {}
	graphArray.forEach(item => {
		graph[item.filename] = {
			dependencies: item.dependencies,
			code: item.code
		}
	})
	// 返回依赖图谱
	return graph
}
const graphInfo = makeDependenciesGraph('./src/index.js')
```
通过上面这个函数，我们就能根据打包的入口文件一层一层遍历最终返回这个`graph`图谱，这个图谱包含了所有模块的信息，我们最后生成文件就能根据这个图谱去生成在浏览器可以直接运行的代码。这个图谱大概是一个对象，对象中每个属性就是一个模块的路径，属性值又是一个对象，包含了这个模块的引入模块和代码：
```javascript
{
  './src/index.js': {
    dependencies: { './message.js': 'src\\message.js' },
    code: '"use strict";\n' +
      '\n' +
      'var _message = _interopRequireDefault(require("./message.js"));\n' +
      '\n' +
      'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
      '\n' +
      'console.log(_message["default"]);'
  },
  'src\\message.js': {
    dependencies: { './word.js': 'src\\word.js' },
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports["default"] = void 0;\n' +
      '\n' +
      'var _word = require("./word.js");\n' +
      '\n' +
      'var message = "say ".concat(_word.word);\n' +
      'var _default = message;\n' +
      'exports["default"] = _default;'
  },
  'src\\word.js': {
    dependencies: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.word = void 0;\n' +
      "var word = 'hello';\n" +
      'exports.word = word;'
  }
}
```


## 生成代码
```javascript
// bundle.js
const generateCode = (entry) => {
	const graph = JSON.stringify(makeDependenciesGraph(entry));
	return `
	(function(graph){
		function require(module) {
			function localRequire(relativePath) {
				return require(graph[module].dependencies[relativePath])
			}
			var exports = {}
			(function(require, exports, code){
				eval(code)
			})(localRequire,exports, graph[module].code)
			return exports;
		};
		require('${entry}')
	})(${graph})
	`
}

const code = generateCode('./src/index.js')
```
按照上面的这个函数去执行图谱，最终生成的就是一个可以直接在浏览器跑的代码，这里这个代码难度比较大，大家自己可以看一下。经过这个函数执行后生成的一个可执行的`js`代码字符串：
```javascript
        (function(graph){
                function require(module) {
                        function localRequire(relativePath) {
                                return require(graph[module].dependencies[relativePath])
                        }
                        var exports = {}
                        (function(require, exports, code){
                                eval(code)
                        })(localRequire,exports, graph[module].code)
                        return exports;
                };
                require('./src/index.js')
        })({"./src/index.js":{"dependencies":{"./message.js":"./src\\message.js"},"code":"\"use strict\";\n\nvar
_message = _interopRequireDefault(require(\"./message.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(_message[\"default\"]);"},"./src\\message.js":{"dependencies":{"./word.js":"./src\\word.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _word = require(\"./word.js\");\n\nvar message = \"say \".concat(_word.word);\nvar _default = message;\nexports[\"default\"] = _default;"},"./src\\word.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.word = void 0;\nvar word = 'hello';\nexports.word = word;"}})
```
