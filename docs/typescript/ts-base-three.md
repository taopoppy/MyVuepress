# TS 类的相关

`TypeScript`当中的类和`ES6`当中的类实际上很相似

## 类的定义和继承
### 1. 类的定义
```typescript
class Person {
	// 类属性
	name: string;
	// 类构造方法
	constructor(name: string) {
		this.name = name
	}
	// 类方法
	getName() {
		return this.name
	}
}

const person = new Person('taopoppy')
console.log(person.name) // taopoppy
```
基本上这种写法在以前的`c`语言和`C++`当中很常见，也没有什么太大的难度。

### 2. 类的继承
```typescript
class Person {
	name: string;
	constructor(name: string) {
		this.name = name
	}
	getName() {
		return this.name
	}
	getFirstName() {
		return `person ${this.name}`
	}
}


class Teacher extends Person {
	// 派生类的构造函数必须要包含super的调用
	constructor(name: string) {
		super(name)
	}
	// 重写类方法(一)
	getName() {
		return `Teacher ${this.name}`
	}
	// 重写类方法(二)
	getFirstName() {
		console.log(this.name)
		return super.getFirstName()
	}
}

const teacher = new Teacher('taopoppy')
console.log(teacher.getFirstName()) // Teacher taopopy
```
关于类的继承我们有两个重要的点需要说明
+ <font color=#DD1144>派生类包含了一个构造函数，它必须调用super()，它会执行基类的构造函数。而且，在构造函数里访问this的属性之前，我们一定要调用super()。这个是TypeScript强制执行的一条重要规则。</font>

+ <font color=#DD1144>重写类方法一般有两种情况，第一种就是子类重写的方法和基类毫无关系，那么这种情况直接重写即可。第二种情况就是子类重写的方法需要调用基类的方法，那么就要使用到super这个关键字，super即代表了基类实体</font>

## 类中的访问类型
访问类型毫无疑问要使用到下面这三个关键字：<font color=#1E90FF>private</font>、<font color=#1E90FF>public</font>、<font color=#1E90FF>protected</font>

### 1. public
这个关键字的意思就是：<font color=#DD1144>public允许在类的内外都被调用</font>

对于上述的所有代码默认的类属性和类方法都是`public`来修饰的。只不过`public`修饰的时候可不写

### 2. private
这个关键词的意思就是：<font color=#DD1144>private修饰的只允许在类内被使用</font>

```typescript
class Person {
	name: string;
	private age: number;
	getName(name: string) {
		this.name = name
	}
	getAge() {
		return this.age // 正确
	}
}

class Teacher extends Person {
	getName() {
		console.log(this.age) // 错误
	}
}

const teacher = new Teacher()
console.log(teacher.age) // 错误
```

### 3. protected
这个关键词的意思就是：<font color=#DD1144>允许在类内以及继承的子类当中使用</font>

```typescript
class Person {
	name: string;
	protected age: number;
	getName(name: string) {
		this.name = name
	}
	getAge() {
		return this.age // 正确
	}
}


class Teacher extends Person {
	getName() {
		console.log(this.age) // 正确
	}
}

const teacher = new Teacher()
console.log(teacher.age) // 错误
```
不过值得注意的是：<font color=#1E90FF>构造函数也可以被标记成protected。这意味着这个类不能在包含它的类外被实例化，但是能被继承</font>


## 类中的构造器
### 1. 构造器的简易写法
首先关于`constructor`实际上主要说的有一个简易写法。一定要记住：
```typescript
class Person {
	// 第一种写法
	public name:string
	private age: number = 8
	constructor(name: string) {
		this.name =name
	}

	// 第二种写法
	constructor(
		public name: string, // 等价于 public name:string 和 this.name =name
		private age: number = 8
	) {}


	public showMessage() {
		console.log(this.name, this.age)
	}
}

const person = new Person('taopoppy')
person.showMessage()
```

### 2. 子类的构造器
<font color=#1E90FF>子类的构造器是一定要调用super()方法来调用基类的构造函数</font>

```typescript
class Person {
	constructor(public name:string) {}
}

class Teacher extends Person {
	constructor(public age:number, name:string) {
		super(name) // 调用父类的构造函数
	}
}

const person = new Teacher(25, 'taopoppy')
```

## 类中的寄存器
### 1. set和get
`typescript`当中的寄存器是包含<font color=#1E90FF>set</font>和<font color=#1E90FF>get</font>两个关键字的，他们的作用通常是一种对类属性的一种保护作用

```typescript
const PASSWORD = '****'
let password = '$$$$'

class Employee {
	constructor(private _message:string) {}
	get message() {
		return password === PASSWORD? this._message: undefined
	}
	set message(message:string) {
		if(password === PASSWORD) {
			this._message = message
		} else {
			console.log('no authority')
		}
	}
}

const employee = new Employee('马保熟牛逼')
console.log(employee.message) // undefined  （密码不正确，就无法获取正确的message）
employee.message = '年轻人不讲武德' // no authority
console.log(employee.message) // undefined （密码不正确，设置的东西也未设置成功）
```

通过上面的代码，我们有下面几个点来总结：
+ <font color=#DD1144>一般私有变量通常前面使用下划线_来代表，然后去掉下划线的名称是暴露给外部的</font>
+ <font color=#1E90FF>message虽然形式上是函数，但是前面添加了set和get就是对this._message这个私有属性的保护属性</font>

### 2. 静态属性
我们下面来写一个单例模式：
```typescript
class Demo {
	private static instance:Demo

	private constructor(public name:string = 'taopoppy') {}

	static getInstance(name?:string) {
		if(!this.instance) {
			this.instance = new Demo(name)
		}
		return this.instance
	}
}

const demo1 = Demo.getInstance()
const demo2 = Demo.getInstance()
console.log(demo1 === demo2) // true
console.log(demo2.name) // taopoppy
```
其中使用到了`static`关键词，使用`static`修饰的属性和方法是直接挂在在类上的，并不是类的实例上的，可以直接通过类名.xxx的方式来调用静态属性和静态方法。

## 抽象类
<font color=#DD1144>abstract</font>是定义抽象类的关键字，在多个不同类当中拥有共同的属性，我们就可以将共同的属性写在抽象类当中，然后被其他类去继承

```typescript
// 抽象类
abstract class Geom {
	// 抽象方法：不同的类中的这个方法有不同的实现
	abstract getArea(): number
}

class A extends Geom{
	constructor(public side:number) { super()}
	getArea() {
		return this.side ** 2
	}
}

class B extends Geom{
	constructor(public height:number, public width:number) { super()}
	getArea() {
		return this.height * this. width / 2
	}
}
```
