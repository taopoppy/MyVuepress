# Typescript类内装饰器

## 方法装饰器
方法装饰器，顾名思义就是对类里方法使用装饰器，起到对类内方法的一些装饰和修改的作用，分为对<font color=#1E90FF>普通函数装饰器</font>和<font color=#1E90FF>静态函数装饰器</font>。
```typescript
// 装饰器装饰普通方法
// target对应的是类的prototype
// key为装饰的方法的名称
// descriptor是用来描述函数属性的对象
function getNameDecorator(target:any, key:string,descriptor:PropertyDescriptor) {
	console.log(target) // Test {getName: [function]}
	console.log(key) // 'getName'
	console.log(descriptor) // { value: [Function], writable: true, enumerable: true, configurable: true }
}

// 装饰器装饰静态方法的时候，target对应的是类的构造函数
function getClassNameDecorator(target:any, key:string) {
	console.log(target)
	console.log(key)
}

class Test {
	name:string;
	constructor(name:string) {
		this.name = name
	}
	@getNameDecorator  // 装饰器装饰普通方法
	getName() {
		return this.name
	}

	@getClassNameDecorator // 装饰器装饰静态方法
	static getClassName() {
		return 'test'
	}
}
```
方法装饰器，顾名思义就是对已有的方法进行装饰和修改，它有哪些用途或者说怎么去使用呢，我们来举个简单的例子：
```typescript
function getNameDecorator(target:any, key:string,descriptor:PropertyDescriptor) {
	// 修改函数本身的值，或者说修改函数当中逻辑
	descriptor.value = function() {
		return '123'
	}
	// 修改函数的属性，使其在外部不能被修改
	descriptor.writable = false
}
...
let test = new Test('taopoppy')
// 下面这种写法就是错误的，因为getName在方法装饰器当中被定义了方法不可重写（descriptor.writable = false）
test.getName = () => {
	return '456'
}
```

## 访问器的装饰器
访问器装饰器，顾名思义就是对类内的访问器进行使用装饰器，起到对访问器的装饰和修改的作用。
```typescript
// 访问器的装饰器
// target是Test访问器的prototype
// key就是访问器的名称
// descriptor就是访问器的属性对象
function visitDecortor(target:any, key:string, descriptor:PropertyDescriptor) {
	console.log(target) // Test { name: [Getter/Setter] }
	console.log(key) // name
	console.log(descriptor) // { get: [Function: get], set: [Function: set], enumerable: true, configurable: true }
}

class Test {
	private _name:string;
	constructor(name:string) {
		this._name = name
	}
	get name() {
		return this._name
	}
	@visitDecortor
	set name(name:string) {
		this._name = name
	}
}
```
这里要注意的就是不能同时在`get`和`set`上面使用相同的装饰器。

## 属性装饰器
属性装饰器，顾名思义，就是给类当中的属性添加装饰器，起到对属性的装饰或者修改的作用
```typescript
// 属性装饰器
// target为类的原型
// key为属性的名称
function nameDecorator(target:any, key:string):any {
	// 自己创建descriptor并且返回
	const descriptor: PropertyDescriptor = {
		writable:false
	}
	return descriptor
}

class Test {
	@nameDecorator
	name:string;
	constructor(name:string) {
		this.name = name
	}
}

let test = new Test('taopoppy')
test.name = 'xxx' // 报错
console.log(test.name)
```
<font color=#1E90FF>通过上面的代码可以看到属性装饰器是没有第三个参数的，所以我们想要修改关于属性的descriptor对象，就要自己创建并且返回的方式来修改，返回的descriptor会代替旧的属性的descriptor</font>

## 参数装饰器
参数装饰器，顾名思义就是在类当中的函数里，对函数参数进行装饰
```typescript
// 参数装饰器
// target是原型
// key是参数所在的函数的名称
// paramIndex是参数所在的参数数组当中的位置
function paramDecorator(target:any, key:string, paramIndex:number) {
	console.log(target) // Test { getInfo: [Function] }
	console.log(key) // 'getInfo'
	console.log(paramIndex) // 0
}

class Test {
	getInfo(@paramDecorator name:string, age:number) {
		console.log(name, age)
	}
}

let test = new Test()
test.getInfo('taopoppy', 25)
```

## Demo
我们来书写一个简单的例子，下面这个例子错误的地方就是`useInfo`是`undefined`，所以不存在`name`和`age`属性，在返回的时候就会报错：
```typescript
const useInfo:any = undefined

class Test {
	getName() {
		return useInfo.name
	}
	getAge() {
		return useInfo.age
	}
}

const test = new Test()
test.getName()
test.getAge()
```
那么装饰器可以帮助我们做什么呢，装饰器可以帮助我们捕获错误，虽然我们可以使用`try catch`来捕获，但是太麻烦：
```typescript
const useInfo:any = undefined

function catchError(msg:string) {
	return function(target:any, key:string,descriptor:PropertyDescriptor) {
		const fn = descriptor.value
		descriptor.value = function() {
			try {
				fn()
			} catch (error) {
				console.log(msg)
				console.log(error.toString())
			}
		}
	}
}

class Test {
	@catchError('getName 存在问题')
	getName() {
		return useInfo.name
	}
	@catchError('getAge 存在问题')
	getAge() {
		return useInfo.age
	}
}

const test = new Test()
test.getName()
test.getAge()
```
我们上面创建了一个装饰器`catchError`，这个是个工厂函数，返回的是一个装饰器，这样可以根据传入不同的错误提示，定位错误发生的位置和具体的错误信息。

<font color=#DD1144>这也提示我们装饰器并非只能用于装饰的作用，也可以使用装饰器进行代码的复用</font>