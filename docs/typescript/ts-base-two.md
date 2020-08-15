# TS 基础语法

## 基础和对象类型

<font color=#9400D3>我们知道，TS 当中的静态类型能帮助我们更直观的了解变量的属性和内容</font>

```typescript
// 基础类型 null, undefined, symbol , boolean, void
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
const numbers: number[] = [1, 2, 3];

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

## 类型注解和类型推断

### 1. 概念梳理

```typescript
// type annotation 类型注解：我们来告诉TS变量是什么类型
let count: number; //（确定的唯一类型）
let count1: number | string; // （可能为number，也可以能为string）
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
// TypeScript
const b1 = function(param: number): number {
  return param;
};
// TypeScript
const b2: (param: number) => number = function(param) {
  return param;
};
```

```typescript
// Javascript
const c = (param) => {
  return param;
};
// TypeScript
const c1: (param: number) => number = (param) => {
  return param;
};
// TypeScript
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

## interface 接口
