# TS 基础语法

## 基础和对象类型

### 1. TS的类型
<font color=#9400D3>我们知道，TS 当中的静态类型能帮助我们更直观的了解变量的属性和内容</font>

```typescript
// 基础类型 null, undefined, symbol , boolean，string，number，void（ts当中无返回值的函数返回值类型）
const count: number = 123;
const namt: string = "taopoppy";

// 对象类型（基础类型组合而成的普通对象类型）
const teacher: {
  name: string;
  age: number;
} = {
  name: "taopoppy",
  age: 25,
};

// 对象类型（数组）
const numbers: number[] = [1, 2, 3]; // 数组当中每一项都必须是number类型的
const numbers1: any[] = [1, 'str', true] // 数组当中每一项都是任意类型

// 对象类型（类）
class Person {}
const taopoppy: Person = new Person();

// 对象类型（函数）
const getTotal: () => number = () => {
  // 函数的名称是getTotal
  // 函数的类型是：() => number
  // 函数的实现是：() => { return 123}
  return 123;
};
```

### 2. JSON转换
关于`JSON`转换有两个函数，分别是`JSON.stringify`和`JSON.parse`
+ <font color=#1E90FF>JSON.stringify是将对象类型转换成为字符串类型，所以返回值可以被推断出来一定是string类型</font>
+ <font color=#1E90FF>JSON.parse是将字符串类型转换成为对象类型的，所以返回值虽然我们知道是Object类型，但是ts并不能知道具体是什么样子的object，所以返回值类型为any, 所以需要我们自定义object类型</font>

```typescript
const taopoppy = {
	name: 'taopoppy',
	age: 25
}

const str = JSON.stringify(taopoppy) // str: string
const obj = JSON.parse(str) // obj: any
```


## 类型注解和类型推断

### 1. 概念梳理

```typescript
// type annotation 类型注解：我们来告诉TS变量是什么类型
let count: number; //（确定的唯一类型）
let count1: number | string; // （可能为number，也可以能为string，这种情况最适用于一个变量会在多个类型之间相互变化的）
let count2: any; // （任何类型，不推荐经常这样写）

// type inference 类型推断:TS会自动的去尝试分析变量的类型
let countInference = 123;
```

### 2. 注解和推断的作用

```typescript
// 如果TS能够自动分析变量类型，我们就什么都不需要做
// firstNumber和secondNumber都是确定的类型，我们实际上不需要注解
const firstNumber = 1;
const secondNumber = 2;
const total = firstNumber + secondNumber;

// 如果TS无法分析变量类型的话，我们就需要使用类型注解
// 函数参数无法在没有调用函数的时候知道类型，函数参数必须写注解
function getTotal(firstNumber: number, secondNumber: number) {
  return firstNumber + secondNumber;
}
```

<font color=#DD1144>无论是类型推断和类型注解，最终都是一个目的，就是让编译器清楚的知道代码中每个变量的类型。编译器能自己推断出来的就可以自己类型推断，推断不出来的需要我们来做类型注解，帮助编译器去知道变量类型</font>

## 函数相关

### 1. 函数定义

TS 中函数的定义和 JS 当中完全一致：只不过 TS 当中稍微难懂一些，我们下面列出三种`Javascript`的函数定义以及相对应的`TypeScript`的函数定义写法：

```typescript
// Javascript
function a(param) {
  return param;
}

// TypeScript
function a1(param: number): number {
  return param;
}
```

```typescript
// Javascript
const b = function(param) {
  return param;
};

// TypeScript(类型注解写在值当中，这种ts会根据值的类型推断类型)
const b1 = function(param: number): number {
  return param;
};

// TypeScript(类型注解写在变量上，这种ts就根据你的声明来确定类型)
const b2: (param: number) => number = function(param) {
  return param;
};
```

```typescript
// Javascript
const c = (param) => {
  return param;
};
// TypeScript(类型注解写在变量上)
const c1: (param: number) => number = (param) => {
  return param;
};
// TypeScript(类型注解写在值当中)
const c2 = (param: number): number => {
  return param;
};
```

### 2. 函数注解

<font color=#1E90FF>函数注解，通常都要将函数参数和函数的返回值都进行注解，因为不一定函数的返回值能根据函数的参数推断出来</font>，所以我们最好在书写函数的时候将函数的返回值注解出来

<font color=#DD1144>TS 的函数返回值类型有多种结果</font>，如下

```typescript
// 函数有返回值，且类型确定
function add(first: number, second: number): number {
  return first + second;
}

// 函数无返回值，TS函数返回值类型为void
function sayHello(): void {
  console.log("hello");
}

// 函数永远不可能执行到最后，TS函数返回值类型为never
function errorEmitter(): never {
  // 1. 第一种情况，函数永远不能执行到console
  throw new Error();
  console.log(123);

  // 2. 第二种情况： 函数中有死循环
  while (true) {}
}
```

### 3. 函数参数解构

在函数参数解构的时候，经常会有人犯下面这样的错误：

```typescript
function add({ first: number, second: number }): number {
  return first + second;
}
```

错误就发生在，<font color=#DD1144>函数参数注解，应该对每个参数整体做注解</font>，所以上述代码中函数参数是一个对象，应该对对象整体做注解，而不是对对象中每个属性做注解，对象这个整体才是函数参数，对象中的属性可不是单独的函数参数，所以正确的写法如下：

```typescript
function add({ first, second }: { first: number; second: number }): number {
  return first + second;
}

const obj = { first: 11, second: 22 };
const total = add(obj);
```


## 数组和元组
### 1. 数组（Array）
单一性的数组我们这里就不介绍了，前面都有固定的写法，我们这里介绍一下多类型数组，比如说在一个数组里，可能有多种类型的元素，我们可以使用下面的这种写法；
```typescript
// 单一基础类型（数组每个元素只能是这种基础类型）
const boolArr: boolean[] = [false, true]
const strArr: string[] = ['str1', 'str2', 'str3']
const numArr: number[] = [1, 2, 3, 4]

// 单一对象类型（数组每个元素只能是这种对象类型）
// 数组中每个元素都是一个{name:string}类型的对象
const objArr:{name: string}[] = [
	{ name: 'taopoppy' },
	{ name: 'wangziyao' },
]


// 多种类型(数组每个元素可能是多个类型中的某一种)
const arr: (number | string | boolean)[]
```

### 2. 元组（Tuple）
元组的概念是：<font color=#DD1144>元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同</font>
```typescript
// 这个数组长度只能为3，且第一个元素类型必须是字符串，第二个元素必须为数字类型，第三个必须是布尔类型
let teacher:[string, number, booler]
```

### 3. 枚举（Enum）
<font color=#DD1144>enum类型是对JavaScript标准数据类型的一个补充</font>。 像`C#`等其它语言一样，使用枚举类型可以为一组数值赋予友好的名字。

```typescript
enum Color {Red, Green, Blue}
let c: Color = Color.Green;
```
默认情况下，从`0`开始为元素编号。 你也可以手动的指定成员的数值。 例如，我们将上面的例子改成从`1`开始编号：
```typescript
enum Color {Red = 1, Green, Blue}
let c: Color = Color.Green;
```
或者，全部都采用手动赋值：
```typescript
enum Color {Red = 1, Green = 2, Blue = 4}
let c: Color = Color.Green;
```
枚举类型提供的一个便利是你可以由枚举的值得到它的名字。 例如，我们知道数值为`2`，但是不确定它映射到`Color`里的哪个名字，我们可以查找相应的名字：

## interface 接口
`interface`是对某种自定义类型进行复用的一种技术，某种自定义类型会在多个地方重复使用，我们即可将其抽象为一种接口拿出定义：
```typescript
interface Person {
	name: string
}

const getPersonName = (person: Person) => {
	return person.name
}

const setPersonName = (person: Person, name: string) => {
	person.name = name
}
```
上述代码当中多个函数入参当中都使用到了`Person`这个接口，很方便

这里简单说明一下`interface`和`type`的区别，<font color=#1E90FF>interface只能申明函数和对象，不能声明基础类型，但是type都可以，甚至是基础类型和元组等等</font>，具体的区别我们这里推荐一篇[文章](https://juejin.cn/post/6844904114925600776#heading-7)


### 1. 可选属性
接口里的属性不全都是必需的。 有些是只在某些条件下存在，或者根本不存在。 可选属性在应用`option bags`模式时很常用，即给函数传入的参数对象中只有部分属性赋值了。
```typescript
interface Person {
  name: string;
	age?: number
}

const getPersonAge = (person: Person) => {
	return person.age
}

const person = {
	name: 'taopoppy'
}

console.log(getPersonAge(person)) // undefined
```
`age`属性是可选的，所以在设置的时候可以选择不传，但是值就是`undefined`

### 2. 只读类型（readonly）
一些对象属性只能在对象刚刚创建的时候修改其值。 你可以在属性名前用`readonly`来指定只读属性:
```typescript
interface Person {
	readonly name: string
}

const getPersonName = (person: Person) => {
	return person.name
}

const setPersonName = (person: Person, name: string) => {
	person.name = name // 报错，name属性不能被修改
}
```

### 3. 字面量的强校验
我们来看一个比较重要的问题：
```typescript
interface Person {
	readonly name: string;
	age?: number
}


const getPersonAge = (person: Person) => {
	console.log(person.age)
	return person.age
}

// 直接将字面量对象作为参数传入
getPersonAge({name: 'taopoppy', address: 'china'}) // 错误
```
<font color=#1E90FF>将字面量对象作为参数直接传入就会报错，因为这种写法会进行强校验，也就是说如果一个对象字面量存在任何“目标类型”不包含的属性时，你会得到一个错误。在Person当中并不包含address这个属性，传入就会出错</font>

这种有三种方法解决：

<font color=#1E90FF>**① 赋值给另一个变量绕开检查**</font>

```typescript
const person = {name: 'taopoppy', address: 'china'}
getPersonAge(person)
```
这种不会报错，因为`person`作为非字面量对象是不会经过强校验的

<font color=#1E90FF>**② 类型断言绕开检查**</font>

```typescript
getPersonAge({name: 'taopoppy', address: 'china'} as Person)
```
这种强行将字面量对象作为`Person`类型写法出现，编译器也不会去检查，因为你已经明确告诉编译器，我写的就是`Person`类型，不需要你检查。

<font color=#1E90FF>**③ 最佳方式：字符串签名索引**</font>

确定这个对象可能具有某些做为特殊用途使用的额外属性，会带有任意数量的其它属性，那么我们可以这样定义它：
```typescript
interface Person {
	readonly name: string;
	age?: number;
	[propName: string]:any // 最佳的方式：表示Person除了name和age还有别的属性
}


const getPersonAge = (person: Person) => {
	console.log(person.age)
	return person.age
}

getPersonAge({name: 'taopoppy', address: 'china'})
```
<font color=#9400D3>字符串签名索引为什么是最佳方式，因为它没有绕开强校验，而是以一种更合理的方式面对强校验</font>


### 4. 接口继承
接口之间还可以相互继承，继承的接口会拥有被继承接口的所有方法和属性：
```typescript
interface Person {
	readonly name: string;
	age?: number;
	[propName: string]:any
}

// 1. 继承
interface Teacher extends Person {
	teach(): void
}

// 2. 使用
const getPersonAge = (person: Teacher) => {
	person.teach()
}

getPersonAge({
	name: 'taopoppy',
	address: 'china',
	teach() {
		console.log('say hello') // 3. 必须有teach方法
	}
})
```

### 5. 函数接口
接口不仅仅可以定义对象的结构，还能定义函数的接口，函数包括参数和返回值：
```typescript
interface Person {
	readonly name: string;
	age?: number;
	[propName: string]:any;
	say: SayHi
}

// 1. 函数的类型，参数名称word，参数类型string，返回值类型string
interface SayHi {
	(word: string): string
}

const getPersonAge = (person: Person) => {
	person.teach()
}

getPersonAge({
	name: 'taopoppy',
	address: 'china',
	say(word:string) {
		return `someon say ${word}` // 2. 简单实用
	}
})
```
