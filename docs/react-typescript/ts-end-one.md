# Typescript类外装饰器

+ <font color=#9400D3>装饰器的本质就是一个函数</font>
+ <font color=#1E90FF>装饰器通过 @ 符号来进行使用</font>
+ <font color=#1E90FF>装饰器属于实验性的语法，需要在tsconfig.json当中设置experimentalDecorators和emitDecoratorMetadata为true</font>
+ <font color=#DD1144>类的装饰器在什么时候执行，在定义装饰器的时候就被执行了，而不是在类进行实例化的时候，因为是对类进行装饰，而不是对类的实例进行装饰</font>
+ <font color=#DD1144>类装饰器接受的参数是构造函数</font>

## 什么是装饰器
```typescript
// 1.定义装饰器
function testDecorator(constructor:any) {
	constructor.prototype.getName = () => {
		console.log('taopoppy')
	}
}

function testDecorator1(constructor:any) {
	constructor.prototype.getAge = () => {
		console.log('25')
	}
}

// 2. 使用装饰器对类进行装饰
@testDecorator
@testDecorator1
class Test {}


const test = new Test()
(test as any).getName()
(test as any).getAge()
```
从上面可以看到，一个类可以有多个装饰器，<font color=#1E90FF>同一个类的装饰器的写法是并列的，但是执行顺序是从上到下的</font>

## 装饰器工厂
工厂模式大家都应该很熟悉，什么是装饰器工厂呢？因为装饰器本身是个函数，所以如果有一个函数能够返回装饰器这种函数，那么这种函数就是装饰器工厂，我们延续上面的例子
```typescript
// 装饰器工厂，根据传入的不同参数可以获取不同的装饰器函数
function Decorator(params:number){
	switch (number) {
		case 1:
			return 	function(constructor:any) {
				constructor.prototype.getName = () => {
					console.log('taopoppy')
				}
			}
			break;
		default:
			return 	function(constructor:any) {
				constructor.prototype.getAge = () => {
					console.log('25')
				}
			}
			break;
	}
}

// 装饰器的写法变化
@Decorator(1)
class Test1 {}

@Decorator(2)
class Test2 {}
```

## 正规的类装饰器
通过上面的例子我们对装饰器有了大体的概念理解之后，我们来写一个标准的装饰器：
```typescript
function testDecorator() {
	return function<T extends new (...args: any[]) => {}>(contructor:T) {
		return class extends contructor {
			name = 'taopoppy'
			getName() {
				return this.name
			}
		}
	}
}

const Test = testDecorator()(class {
	name:string;
	constructor(name:string) {
		this.name = name
	}
})

const test = new Test('wangziyao')
console.log(test.getName())
```
标准的类装饰器为什么写法这么复杂，解决的一个核心为题就是：<font color=#DD1144>标准的类装饰器给类装饰的所有属性和方法可以在编辑器的语法提示当中显示出来</font>

下面我们解释一下上面的代码的含义，因为上述代码确实有点复杂
+ <font color=#1E90FF>首先类的装饰器是函数，函数的参数是个构造函数，所以我们通过T来继承new (...args:any[])=> {}，后者实际就是个构造函数，构造函数的本质就是接受一大堆参数，返回一个对象</font>

+ <font color=#1E90FF>从函数执行的角度来讲，装饰器的逻辑肯定在类定义之后，所以从最开始的写法到标准的写法，有点类似于React当中的HOC高阶组件的写法。实际上在原有的类的基础上返回另一个高级的新类而已</font>