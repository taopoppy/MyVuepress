# 高级类型

## 联合类型与类型保护
```typescript
interface Brid {
	fly: boolean;
	sing: ()=> {};
}

interface Dog {
	fly:boolean;
	bark: () => {}
}

function trainAnimal(animal: Brid|Dog) {
	animal.fly
}
```
可以看到的是，当我们使用`Brid|Dog`这种联合类型来表示`animal`这种动物类型的时候，在使用`animal`类型的时候只会语法提示`Brid`和`Dog`共有的属性，因为并不能保证具体使用函数的时候到底传入的是什么类型，所以我们有很多种方法来实现<font color=#9400D3>类型保护</font>

### 1. 类型断言
<font color=#DD1144>类型断言是我们在能保证逻辑一定正确的情况下告诉编译器一定是这种类型</font>，这样编译器就会和你的想法保持一致。

```typescript
function trainAnimal(animal: Brid|Dog) {
	if(animal.fly) {
		(animal as Brid).sing()
	}
	(animal as Dog).bark()
}
```
<font color=#9400D3>这种断言的方式和自己对逻辑的理解确保类型是正确的，也就是类型保护</font>

### 2. in语法
比起类型断言，`in`语法应该是从编译器角度更靠谱的方法，我们来看看：
```typescript
function trainAnimalSecond(animal: Brid|Dog) {
	if('sing' in animal) {
		animal.sing()
	} else {
		animal.bark()
	}
}
```
通过`in`语法判断在程序运行的时候到底适用什么方法，如果`sing`方法存在于`animal`这个变量上，说明应该是`Brid`类型，否则应该是`Dog`类型。

### 3. typeof
`typeof`来做类型保护大多用在基础类型上的计算和操作；
```typescript
function add(first: number | string, second: number | string) {
	if(typeof first === 'string' || typeof second === 'string') {
		return `${first}${second}`
	}
	return first + second
}
```

### 4. instanceof
基础类型我们可以使用`typeof`，对于自定义的类型我们应该使用`instanceof`:
```typescript
class NumberObj {
	count: number=0;
}

function addSecond(first: object | NumberObj, second: object | NumberObj) {
	if(first instanceof NumberObj && second instanceof NumberObj) {
		return first.count + second.count
	}
	return 0
}
```
<font color=#DD1144>注意，如果使用instanceof来做类型保护，自己定义的类型一定是一个class类，而不是一个interface接口，接口无法使用instanceof来做类型判断</font>

## 泛型
### 1. 函数泛型
<font color=#1E90FF>泛型在函数当中的应用大多数都是用来描述参数之间，或者参数和返回值之间类型的关系的</font>，我们来看几种使用泛型的函数都有什么样的作用：

```typescript
// 保证了函数的两个参数的类型一致
function join<T>(first: T, second: T) {
	return `${first}${second}`
}

join<string>('1','2') // 显式给泛型赋值类型
join(1,2) // 编译器会自动推断出泛型为number类型

// 保证了函数的参数和返回值类型保持一致
function map<T>(params: T[]):T {
	return params[0]
}

map<string>(['1','2','3'])
```

### 2. 类中的泛型
<font color=#1E90FF>**① 泛型类型为基础类型**</font>

在类中怎么使用泛型呢，我们来举个简单的例子，比如我们下面这个类当中会存数据，但是我们不想仅仅局限于存`string`类型的数据，所以我们可以使用泛型：
```typescript
class DataManager<T> {
	constructor(private data: T[]) {}
	getItem(index:number):T {
		return this.data[index]
	}
}

const data = new DataManager<string>(['1','2']) // 显式赋值泛型
const data1 = new DataManager([1,2,3])    // 编译器自动推断泛型类型
```
类中最简单的泛型的使用就是如此，但是呢，上述代码当中`T`类型仅仅能代表基础类型，对于自定义的类型还不行，我们需要定义如下的接口

<font color=#1E90FF>**② 泛型类型为自定义类型**</font>

```typescript
interface Item {
	name:string
}

// 泛型继承了Item
class DataManager<T extends Item> {
	constructor(private data: T[]) {}
	getItem(index:number):string {
		return this.data[index].name
	}
}


const data = new DataManager([
	{ name: 'taopoppy'}
])
```
这个例子稍微复杂了一些，`T`作为泛型来讲，在实际生成类的时候必须是一个具体的类型，而`T`继承了`Item`表示：这个具体的类型必须包含`Item`当中的东西，所以这就是泛型为自定义类型的时候，我们需要这样书写


### 3. 泛型约束
什么是泛型约束呢？泛型虽然叫做泛指的类型，但是当我们如果想给泛型一个类型范围的时候，比如我们只想这个范围是`string`或者`number`，我们同样也可以使用`extends`这个继承的方法：
```typescript
class DataManager<T extends numner | string> {
	constructor(private data: T[]) {}
	getItem(index:number):T {
		return this.data[index]
	}
}
```
虽然这样的需求不需要一定使用泛型来解决，但是使用泛型会十分的方便

### 4. 泛型类型
<font color=#1E90FF>泛型最终在具体的代码执行的时候还是一种具体的类型，那么既然是类型，就可以作为类型声明，所以泛型也可以作为一种类型进行声明</font>，我们来写一个简单的例子:

```typescript
function getFirstElement<T>(parmas:T[]):T {
	return parmas[0]
}

// <T>(params:T[]) => T 就是一个函数类型
// getFirstElement函数定义就是这种类型，所以getFirstElement可以赋值给func
const func: <T>(params: T[]) => T = getFirstElement
```