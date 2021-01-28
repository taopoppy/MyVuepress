# 描述文件

## 描述文件的全局类型
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
