# 高级类型

## 交叉类型
1. 交叉类型是将多个类型合并为一个类型。 这让我们可以把现有的多种类型叠加到一起成为一种类型，它包含了所需的所有类型的特性。 例如，Person & Loggable 同时是 Person 和 Loggable。 就是说这个类型的对象同时拥有了这两种类型的成员。我们大多是在混入（mixins）或其它不适合典型面向对象模型的地方看到交叉类型的使用。 （在 JavaScript 里发生这种情况的场合很多！） 下面是如何创建混入的一个简单例子：
```typescript
function extend<T, U> (first: T, second: U): T & U {     // 通过extends方法将我们传入的两个参数的属性都放在一个对象中
  let result = {} as T & U
  for (let id in first) {
    result[id] = first[id] as any
  }
  for (let id in second) {
    if (!result.hasOwnProperty(id)) {
      result[id] = second[id] as any
    }
  }
  return result                                   // 这个对象的类型属于交叉类型，两个不同类型在这个交叉类型中都有体现
}
class Person {
  constructor (public name: string) {            // 这种简写的方式就等同于声明一个name的公共成员，并在constructor中赋值
  }
}
interface Loggable {
  log (): void
}
class ConsoleLogger implements Loggable {
  log () {
    // ...
  }
}
var jim = extend(new Person('Jim'), new ConsoleLogger())   // 既有name属性，也有log方法
var n = jim.name
jim.log()
```

## 联合类型
1. 联合类型与交叉类型很有关联，但是使用上却完全不同。 偶尔你会遇到这种情况，一个代码库希望传入 number 或 string 类型的参数。 例如下面的函数：
```typescript
//联合类型
function padleft(value:string,padding:any) {
  if(typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value
  }
  if(typeof padding === 'string') {
    return padding + value
  }
  throw new Error(`Expected string or number，got ${typeof padding}`)
}
```
padLeft 存在一个问题，padding 参数的类型指定成了 any。 这就是说我们可以传入一个既不是 number 也不是 string 类型的参数，但是 TypeScript 却不报错。为了解决这个问题，我们可以使用 联合类型做为 padding 的参数：

2. 为了我们在编译的阶段就能对类型做出判断，我们需要使用联合类型
```typescript
function padLeft(value: string, padding: string | number) {
  // ...
}

let indentedString = padLeft('Hello world', true) // 编译阶段报错
```
3. 到底什么是联合类型？
+ **联合类型表示一个值可以是几种类型之一。我们用竖线（|）分隔每个类型**，所以 number | string 表示一个值可以是 number 或 string。

4. **如果一个值是联合类型，我们只能访问此联合类型的所有类型里共有的成员**。
```typescript
interface Bird {
  fly()
  layEggs()
}
interface Fish {
  swim()
  layEggs()
}
function getSmallPet(): Fish | Bird {
  // ...
}
let pet = getSmallPet()
pet.layEggs() // okay
pet.swim()    // error
```
这里的联合类型可能有点复杂：如果一个值的类型是 A | B，我们能够确定的是它包含了 A 和 B 中共有的成员。这个例子里，Fish 具有一个swim 方法，我们不能确定一个 Bird | Fish 类型的变量是否有 swim方法。 如果变量在运行时是 Bird 类型，那么调用 pet.swim() 就出错了

5. 我们可以使用之前的类型断言去改造这个代码
```typescript
if ((pet as Fish).swim) {
  (pet as Fish).swim()
} else {
  (pet as Bird).fly()
}
```

## 类型保护
**1. 用户自定义的类型保护**
+ TypeScript 里的类型保护机制让它成为了现实。 **类型保护就是一些表达式，它们会在运行时检查以确保在某个作用域里的类型**。定义一个类型保护，我们只要简单地定义一个函数，它的返回值是一个类型谓词
```typescript
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined                      // 这里是为专门的自定义类型的做的类型保护的措施，也就是写一个定义类型的函数
}
if (isFish(pet)) {
  pet.swim()
}
else {
  pet.fly()
}
```
注意，使用了类型保护，TS不仅能知道在if当中是Fish类型，在else一定是另外一个类型Bird类型

**2. typeof 类型保护**
+ 针对原始类型的检查，我们直接使用typeof即可
```typescript
function padLeft (value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value
  }
  if (typeof padding === 'string') {
    return padding + value
  }
  throw new Error(`Expected string or number, got '${padding}'.`)
}
```
+ 这些 typeof 类型保护只有两种形式能被识别：typeof v === "typename" 和 typeof v !== "typename"，"typename"必须是 "number"， "string"，"boolean" 或 "symbol",也就是说写法和typename都正确，则使用typeof就是在使用类型保护

**3. instanceof类型保护**
+ instanceof 类型保护是通过构造函数来细化类型的一种方式。
```typescript
class Bird {
  fly () { console.log('bird fly')}
  layEggs () { console.log('bird lay eggs')}
}
class Fish {
  swim () {console.log('fish swim')}
  layEggs () {console.log('fish lay eggs')}
}
function getRandomPet () {
  return Math.random() > 0.5 ? new Bird() : new Fish()
}
let pet = getRandomPet()
if (pet instanceof Bird) { // 这种instranceof类型保护和自定义类型保护都是对自定义类型做判断
  pet.fly()                
}
if (pet instanceof Fish) {
  pet.swim()
}
```

## 可以为null的类型
1. TypeScript 具有两种特殊的类型，null 和 undefined，它们分别具有值 null 和 undefined。我们在基础类型一节里已经做过简要说明。默认情况下，类型检查器认为 null 与 undefined 可以赋值给任何类型。 null 与 undefined 是所有其它类型的一个有效值。 这也意味着，你阻止不了将它们赋值给其它类型，就算是你想要阻止这种情况也不行。
2. --strictNullChecks 标记可以解决此错误：当你声明一个变量时，它不会自动地包含 null 或 undefined。 你可以使用联合类型明确的包含它们：
```typescript
let s = 'foo'
s = null // 错误, 'null'不能赋值给'string'
let sn: string | null = 'bar'
sn = null // 可以

sn = undefined // error, 'undefined'不能赋值给'string | null'
```
3. 注意，按照 JavaScript 的语义，TypeScript 会把 null 和 undefined 区别对待。string | null，string | undefined 和 string | undefined | null 是不同的类型。
4. **可选参数和可选属性**(在使用了 --strictNullChecks，可选参数会被自动地加上 | undefined:)
+ 可选参数默认的是 **确定类型 | undefined**的联合类型
```typescript
function f(x: number, y?: number) {
  return x + (y || 0)
}
f(1, 2)
f(1)
f(1, undefined)
f(1, null) // error, 'null' 不能赋值给 'number | undefined'
```
+ 可选属性默认的也是 **确定类型 | undefined**的联合类型
```typescript
class C {
  a: number
  b?: number
}
let c = new C()
c.a = 12
c.a = undefined // error, 'undefined' 不能赋值给 'number'
c.b = 13
c.b = undefined // ok
c.b = null // error, 'null' 不能赋值给 'number | undefined'
```
**5. null的类型保护和类型断言**
+ 由于可以为 null 的类型能和其它类型定义为联合类型，那么你需要使用类型保护来去除 null。幸运地是这与在 JavaScript 里写的代码一致：
```typescript
function f(sn: string | null): string {
  if (sn === null) {
    return 'default'
  } else {
    return sn
  }
}
```
+ 这里很明显地去除了 null，你也可以使用短路运算符：
```typescript
function f(sn: string | null): string {
  return sn || 'default'
}
```
+ 如果编译器不能够去除 null 或 undefined，你可以使用类型断言手动去除。语法是添加 ! 后缀： identifier! 从 identifier 的类型里去除了 null 和 undefined：
```typescript
function broken(name: string | null): string {
  function postfix(epithet: string) {
    return name.charAt(0) + '.  the ' + epithet // error, 'name' 可能为 null
  }
  name = name || 'Bob'
  return postfix('great')
}

function fixed(name: string | null): string {
  function postfix(epithet: string) {
    return name!.charAt(0) + '.  the ' + epithet // ok
  }
  name = name || 'Bob'
  return postfix('great')
}
broken(null)
```
上面这个例子其实很复杂，因为按照我们书写的逻辑我们是知道postfix内部的name是不可能为null的，但是对于编译器来讲，它就不知道，所以我们要手动告诉编译器，这name是不会为null的

## 字符串字面量类型
1. 字符串字面量类型允许你指定字符串必须具有的确切值。在实际应用中，字符串字面量类型可以与联合类型，类型保护很好的配合。通过结合使用这些特性，你可以实现类似枚举类型的字符串。
```typescript
type Easing = 'ease-in' | 'ease-out' | 'ease-in-out'  // 将字符串所有字面量列举出来 

class UIElement {
  animate (dx: number, dy: number, easing: Easing) {
    if (easing === 'ease-in') {
      // ...
    } else if (easing === 'ease-out') {
    } else if (easing === 'ease-in-out') {
    } else {
      // error! 不能传入 null 或者 undefined.
    }
  }
}

let button = new UIElement()
button.animate(0, 0, 'ease-in')
button.animate(0, 0, 'uneasy') // error
```
你只能从三种允许的字符中选择其一来做为参数传递，传入其它值则会产生错误。