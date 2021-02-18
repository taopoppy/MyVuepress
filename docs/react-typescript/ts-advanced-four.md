# Typescript描述文件

## 全局类型
### 1. 全局函数类型
我们现在比如在`html`文件当中引入了`jquery`，然后我们在`src/page.ts`当中书写一些`jquery`的代码会如何？
```html
<!-- index.html-->
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Document</title>
	<script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.js"></script>
	<script src="./src/page.ts"></script>
</head>
<body>
</body>
</html>
```
```typescript
// src/page.ts
$(function() {
	alert(123)
})
```
这样书写肯定有问题，问题就在于，在`ts`文件当中使用`js`的库是不能直接识别的，我们当然可以根据提示去下载类型文件：
```shell
npm i --save-dev @types/jquery
```
但是我们可以自己去书写一个类型定义文件，我们自己创建一个`src/juqery.d.ts`文件，然后对我们在`ts`文件当中使用的一些东西做一些说明，比如上面的`$`符号在`jquery`是一个变量，也是一个全局函数，那么声明就有两种写法：
```typescript
// jquery.d.ts
// （第一种方法）定义全局变量
declare var $ :(param: () => void) => void

// （第二种方法）定义全局函数
declare function $(param:() => void): void
```

现在我们在`src/page.ts`当中重写一段代码看看：
```typescript
//src/page.ts
$(function() {
	$('body').html('<div>123</div>')
})
```
这样的话，对于`$`就有两种使用方法了，函数参数都多种类型，所以我们就要使用到<font color=#9400D3>函数重载</font>，而且函数返回的还是个带有`html`方法的自定义对象，所以我们重写类型文件如下：
```typescript
// src/juqery.d.ts
interface JqueryInstance {
	html:(html:string) => {}
}

// 定义全局函数
declare function $(readyFunc:() => void): void
declare function $(selector:string): JqueryInstance
```


### 2. interface实现函数重载
函数重载可以使用`interface`定义函数来实现，比如上面我们对`$`进行重载的时候可以这样书写：
```typescript
// jquery.d.ts
interface JQuery {
	(readyFunc:() => void): void;
	(selector:string): JqueryInstance
}

declare var $:JQuery
```
这种写法的意思就是，`$`变量是一种`JQuery`类型的函数，但是函数的实现可以有多种方式，因为`JQuery`这个接口当中定义了很多方式，从而也就实现了函数的重载


### 3. 全局对象类型
在`jquery`当中，`$`不仅仅会做为一个函数，还会作为一个对象去使用，比如，在代码当中会这样使用`$`：
```typescript
// page.ts
$(function() {
	$('body').html('<div>123</div>')
	new $.fn.init()
})
```
对于上面这个`$`要写它的类型文件，就要分析，首先`$`是全局对象，`$.fn`也要是个对象，`$.fn.init`还要是个类，我们只能这样写：
```typescript
// jquery.d.ts
declare function $(readyFunc:() => void): void
declare function $(selector:string): JqueryInstance

declare namespace $ {
	namespace fn {
		class init {}
	}
}
```

### 4. 模块代码的类型描述文件
现在我们比如不在使用`cdn`的方式引入`jquery`，而是使用`npm install jquery`的方式，那么使用`jquery`和对应的类型文件定义又有不同了,我们下面只说`ES6`模块化的内容：

我们首先在项目当中安装`juqery`这个模块：
```shell
npm install jquery --save
```

然后我们看其他文件的改动：
```html
<!-- index.html-->
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Document</title>
	<script src="./src/page.ts"></script>
</head>
<body>
</body>
</html>
```
```typescript
// page.ts
import $ from 'jquery' // 和正常的引入是一致的

$(function() {
	$('body').html('<div>123</div>')
	new $.fn.init()
})
```
```typescript
// jquery.d.ts
// declare module 定义一个模块
declare module 'jquery'{
	interface JqueryInstance {
		html:(html:string) => JqueryInstance
	}

	function $(readyFunc:() => void): void
	function $(selector:string): JqueryInstance

	namespace $ {
		namespace fn {
			class init {}
		}
	}

	// 模块提供给外界的东西一定要导出出去
	export = $
}
```
这样我们就定义了一个`ES6`模块的类型定义文件，当然了我们只是拿`juqery`来做实例，实际开发当中对于引入第三方包的模块，我们最好使用对应的类型文件，也就是要下载`@type/xxx`这种第三方模块，自己定义的模块我们需要使用上述的这种方式来自己书写类型文件。
