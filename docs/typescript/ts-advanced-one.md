# Typescript配置文件

当我们运行`tsc --init`会生成`tsconfig`这个文件，然后这个文件的作用是什么：<font color=#DD1144>ts文件被tsc编译器编译成为js文件的时候是按照tsconfig这个文件当中配置的规则进行编译的</font>

<font color=#1E90FF>值得注意的是tsc并不是在任何时候都会按照tsconfig.json中的规则来编译ts文件的，比如当我们执行tsc demo.ts，通过tsc具体编译某个文件的时候并不会参照tsconfig.json，只有单独使用tsc的时候才会参照tsconfig.json的</font>

<font color=#1E90FF>同时的话，ts-node在编译和运行文件的同时会使用tsconfig.json文件配置的规则去编译的</font>

## 各种配置项
### 1. include&&exclude
在默认的`tsconfig.json`当中只有`compilerOptions`这个大配置项，我们可以通过设置<font color=#9400D3>include</font>来配置：<font color=#1E90FF>我们想编译哪些ts文件</font>：

```json
{
	"include": ["./src"],
	"exclude": ["./node_modules"],
	"compilerOptions": {
		...
	}
}
```
当然了，一般情况下我们只会写`include`或者`exclude`其中的一个就够了，另外还有关于指定编译哪些文件的方式还有`file`字段和正则表达式，其相关的内容在[官网](https://www.tslang.cn/docs/handbook/tsconfig-json.html)都有明确说明，请点击详细查看

但是通常的做法我们在项目当中会将所有的文件写在`src`目录下，然后将编译后的文件文件写在`build`目录下，这个时候直接用`compilerOptions`当中的`rootDir`和`outDir`两个配置即可：
```json
{
	"compilerOptions": {
		"rootDir":"./src",
		"outDir":"./build"
	}
}
```

### 2. compilerOptions
关于`compilerOptions`这个大的配置项在[官网]()有仔细的说明，我们这里介绍一些常用和简单的配置

<font color=#1E90FF>**① Basic Options（基础配置）**</font>

```json
"incremental": true,        // （重要）增量编译。会生成一个tsconfig.tsbuildinfo的文件保存上次编译的内容
"target": "es5",            // （重要）指定ECMAScript目标版本
"module": "commonjs",       // （重要）指定生成哪个模块系统代码
"lib": [],                  //  编译过程中需要引入的库文件的列表。
"allowJs": true,            // （重要）是否对js文件也进行编译，比如你使用es6写js文件，target设置的es5,这个配置就起作用了
"checkJs": true,            // （重要）是否对js文件中的语法进行检测
"jsx": "preserve",          //  在.tsx文件里支持JSX："React"或 "Preserve"
"declaration": true,        //  生成相应的 .d.ts文件。
"declarationMap": true,
"sourceMap": true,
"outFile": "./",            // 将输出文件合并为一个文件。合并的顺序是根据传入编译器的文件顺序
"outDir": "./",             // （重要）指定编译的输出目录
"rootDir": "./",            // （重要）指定编译的入口目录
"composite": true,
"tsBuildInfoFile": "./",
"removeComments": true,     // （重要）删除所有注释，除了以 /!*开头的版权信息。
"noEmit": true,             // 不生成输出文件。
"importHelpers": true,      // 从tslib导入辅助工具函数（比如 __extends， __rest等）
"downlevelIteration": true,
"isolatedModules": true,    // 将每个文件作为单独的模块（与“ts.transpileModule”类似）。
```

<font color=#1E90FF>**② Strict Type-Checking Options（严格模式）**</font>

```json
"strict": true,                // （重要）严格模式，这一项设置为true，下面默认就全部为true
"noImplicitAny": true,         // （重要）是否显式的为any类型声明，true的话一个变量是any类型，必须申明为:any
"strictNullChecks": true,      // （重要）是否强制检查Null类型，true的话null值只能赋值给Null类型的，false的话null可以赋值给其他基础类型
"strictFunctionTypes": true,   // （重要）是否使用函数参数双向协变检查。
"strictBindCallApply": true,
"strictPropertyInitialization": true,
"noImplicitThis": true,
"alwaysStrict": true,
```

<font color=#1E90FF>**③ Additional Checks（增量检查）**</font>

```json
"noUnusedLocals": true,            // （重要）是否对未使用的局部变量则抛错。
"noUnusedParameters": true,        // （重要）是否对未使用的参数则抛错。
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true,
```

<font color=#1E90FF>**④ Module Resolution Options(模块解析配置)**</font>

```json
"moduleResolution": "node",            // （重要）决定如何处理模块，module === "AMD" or "System" or "ES6" ? "Classic" : "Node"
"baseUrl": "./",                       // 解析非相对模块名的基准目录
"paths": {},                           // 模块名到基于baseUrl的路径映射的列表
"rootDirs": [],                        // 根（root）文件夹列表，表示运行时组合工程结构的内容
"typeRoots": [],                       // 要包含的类型声明文件路径列表
"types": [],                           // 要包含的类型声明文件名列表
"allowSyntheticDefaultImports": true,  // 允许从没有设置默认导出的模块中默认导入
"esModuleInterop": true                //（重要）通过为所有导入创建名称空间对象，启用CommonJS和ES模块之间的发射互操作性。
"preserveSymlinks": true,              // 不把符号链接解析为其真实路径
"allowUmdGlobalAccess": true,
```

<font color=#1E90FF>**⑤ Source Map Options（映射选择）**</font>

```json
"sourceRoot": "",                      // 指定TypeScript源文件的路径，以便调试器定位
"mapRoot": "",                         // 为调试器指定指定sourcemap文件的路径，而不是使用生成时的路径
"inlineSourceMap": true,               // 生成单个sourcemaps文件，而不是将每sourcemaps生成不同的文件。
"inlineSources": true,                 // 将代码与sourcemaps生成到一个文件中，要求同时设置了 --inlineSourceMap或 --sourceMap属性。
```

<font color=#1E90FF>**⑥ Experimental Options（实验选项）**</font>

```json
"experimentalDecorators": true,        // 启用实验性的ES装饰器。
"emitDecoratorMetadata": true,         // 给源码里的装饰器声明加上设计类型元数据
```
