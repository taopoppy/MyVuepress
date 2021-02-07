# Typescript模块化

## 命名空间

### 1. 命名空间的原理
我们现在开始写一个最简单的例子，我们提前按照之前所讲的在`tsconfig.json`文件当中配置`"outDir": "./dist"`和`"rootDir": "./src"`后，在`src/page.ts`文件当中去写一段这样的代码：
```typescript
// src/page.ts
class Header {
	constructor() {
		const elem = document.createElement('div')
		elem.innerText = 'This is Header'
		document.body.appendChild(elem)
	}
}

class Page {
	constructor() {
		new Header()
	}
}
```
然后我们在`index.html`当中书写这样的代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Document</title>
	<script src="./dist/page.js"></script>
</head>
<body>
	<script>
		new Page()
	</script>
</body>
</html>
```
然后在命令行当中启动`tsc -w`，这样在浏览器当中打开`index.html`就能看到`Header`的内容。

<font color=#1E90FF>但是这样书写代码是有问题的，对于page.ts当中所有声明的变量都是全局变量，全局变量的增多并不是我们想看到的，为了控制全局变量，我们在ts当中需要引入namespace</font>

```typescript
// page.ts
namespace Home {
	class Header {
		constructor() {
			const elem = document.createElement('div')
			elem.innerText = 'This is Header'
			document.body.appendChild(elem)
		}
	}

	export class Page {
		constructor() {
			new Header()
		}
	}
}
```
这样通过`namespace`命名空间进行约束后，`Page`是挂载到了`Home`这个全局变量上了，但是`Header`并没有，我们可以看一下编译后的`page.js`文件：
```javascript
// dist/page.js
"use strict";
var Home;
(function (Home) {
    var Header = (function () {
        function Header() {
            var elem = document.createElement('div');
            elem.innerText = 'This is Header';
            document.body.appendChild(elem);
        }
        return Header;
    }());
    var Page = (function () {
        function Page() {
            new Header();
        }
        return Page;
    }());
    Home.Page = Page;  // 将Page这个函数挂载到了Home这个全局变量上
})(Home || (Home = {}));
```
同时在`index.html`当中我们也不能在直接使用`new Page()`，而是改用`new Home.Page()`


### 2. 命名空间实战
虽然我们实现了上面的功能，但是在实际应用当中，在`Page`当中可能会有很多的功能，我们需要将其进行分离：
```typescript
// src/page.ts
namespace Home {
	export class Page {
		constructor() {
			new Components.Header()
			new Components.Content()
			new Components.Footer()
		}
	}
}
```
```typescript
// src/components.ts
namespace Components {
	export class Header {
		constructor() {
			const elem = document.createElement('div')
			elem.innerText = 'This is Header'
			document.body.appendChild(elem)
		}
	}

	export class Content {
		constructor() {
			const elem = document.createElement('div')
			elem.innerText = 'This is Content'
			document.body.appendChild(elem)
		}
	}

	export class Footer {
		constructor() {
			const elem = document.createElement('div')
			elem.innerText = 'This is Footer'
			document.body.appendChild(elem)
		}
	}
}
```
如果是这样的话，编译后我们就需要在`index.html`当中去引入`./dist/components.js`和`./dist/page.js`，而且顺序不能变化，如下所示：
```html
<script src="./dist/components.js"></script>
<script src="./dist/page.js"></script>
```
所以你会发现，我们现在需要有这样的需求，编译之后想让编译后的`js`文件按照正确的顺序进行合并，<font color=#1E90FF>恰好我们在之前tsconfig.json当中有这样的配置项outFile</font>，我们按照下面这样配置：
```javascript
"outFile": "./dist/page.js"
```
那么实际上编译后的`components.js`和`page.js`就会按照先后顺序合并成`page.js`放在`dist`目录下，那这样之后，页面只需要引入一个`./build/page.js`即可。<font color=#DD1144>不过当我们设置outFile这种配置后，只能将module设置为amd或者system</font>

<font color=#DD1144>但是这样就没有问题了么，并不是，可以很清晰的发现在src/page.ts文件当中，实际上是Home引用了Componetns当中的东西，所以前后顺序是Components在前，Home在后，虽然代码可以在打包的时候自动识别，但是对于书写代码逻辑的时候，对开发人员是不友好的，我们希望在每个文件能够清晰的看到各个模块之间的引用关系，实际上这也就是类似于import这种模块化方法引入的原因</font>

## import模块化
我们使用`Es`模块的方法来编写一下上面的案例：
```typescript
// page.ts
import { Header, Content, Footer} from './components'

export default class Page {
	constructor() {
		new Header()
		new Content()
		new Footer()
	}
}
```
```typescript
// components.ts
export class Header {
	constructor() {
		const elem = document.createElement('div')
		elem.innerText = 'This is Header'
		document.body.appendChild(elem)
	}
}

export class Content {
	constructor() {
		const elem = document.createElement('div')
		elem.innerText = 'This is Content'
		document.body.appendChild(elem)
	}
}

export class Footer {
	constructor() {
		const elem = document.createElement('div')
		elem.innerText = 'This is Footer'
		document.body.appendChild(elem)
	}
}
```
我们首先来看一下上述两个`ts`文件编译后并且合并后的文件：
```javascript
// dist/page.js
define("components", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Header = (function () {
        function Header() {
            var elem = document.createElement('div');
            elem.innerText = 'This is Header';
            document.body.appendChild(elem);
        }
        return Header;
    }());
    exports.Header = Header;
    var Content = (function () {
        function Content() {
            var elem = document.createElement('div');
            elem.innerText = 'This is Content';
            document.body.appendChild(elem);
        }
        return Content;
    }());
    exports.Content = Content;
    var Footer = (function () {
        function Footer() {
            var elem = document.createElement('div');
            elem.innerText = 'This is Footer';
            document.body.appendChild(elem);
        }
        return Footer;
    }());
    exports.Footer = Footer;
});
define("page", ["require", "exports", "components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Page = (function () {
        function Page() {
            new components_1.Header();
            new components_1.Content();
            new components_1.Footer();
        }
        return Page;
    }());
    exports.default = Page;
});
```
上面的内容不需要仔细看，只需要看到这种是使用了`define`语法，然后的话，我们必须要在`html`文件当中引入`require.js`文件，才能识别这种`define`语法：
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Document</title>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.js"></script>
	<script src="./dist/page.js"></script>
</head>
<body>
	<script>
		// require.js规定的写法
		require(['page'], function(page) {
			new page.default()
		})
	</script>
</body>
</html>
```
所以你能看到，这种方式比较麻烦，而且写法也很古怪，而后面`typescript`和`webpack`结合之后，会将打包做的更好，写法也会更加的简单。

## parcel
<font color=#1E90FF>parcel是一个类似于webpack的工具，只不过它不需要配置</font>

首先先下载它：
```javascript
npm install parcel@next -D
```
然后在`tsconfig.json`也只需要配置`outDir`和`rootDir`。在`html`文件当中我们只需要直接引入`ts`文件即可，不需要什么`require.js`
```html
<script src="./src/page.ts"></script>
```
最后我们在`package.json`当中编写一个关于`parcel`的命令：
```javascript
"script": {
	"test": "parcel ./src/index.html"
}
```
启动`npm run test`，`parcel`会自动分析`index.html`，并且编译所引入的`ts`文件，并且启动一个服务器。