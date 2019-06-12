# 接口
TypeScript 的核心原则之一是对值所具有的结构进行类型检查。它有时被称做“鸭式辨型法”或“结构性子类型化”。 在 TypeScript 里，接口的作用就是为这些类型命名和为你的代码或第三方代码定义契约。

## 接口初探
typescript中的接口直接的可以理解为一个数据结构的模型，如下
```typescript
interface LabelledValue {
  label: string
}

function printLabel(labelledObj: LabelledValue) {
  console.log(labelledObj.label)
}

let myObj = {size: 10, label: 'Size 10 Object'}          // 满足具有一个label为string类型的属性即可，其他属性有无并无做限制
printLabel(myObj)
```
LabelledValue 接口就好比一个名字，用来描述上面例子里的结构。 它代表了有一个 label 属性且类型为string 的对象。 需要注意的是，我们在这里并不能像在其它语言里一样，说传给 printLabel 的对象实现了这个接口。我们只会去关注值的外形。 只要传入的对象满足上面提到的必要条件，那么它就是被允许的。还有一点值得提的是，类型检查器不会去检查属性的顺序，只要相应的属性存在并且类型也是对的就可以。

## 可选属性
1. 带有可选属性的接口与普通的接口定义差不多，只是在可选属性名字定义的后面加一个 ? 符号。
2. 可选属性的好处之一是可以对可能存在的属性进行预定义，好处之二是可以捕获引用了不存在的属性时的错误。
```typescript
interface Square {
  color: string
  area: number
}
interface SquareConfig {
  color?:string             // 属性后面加?表示可选属性
  width?: number
}
function createSquare(config:SquareConfig):Square {            // function f():Square表示函数返回的类型必须是Square接口类型的
  let newSquare = {color: 'white', area: 100}
  if (config.color) {
    newSquare.color = config.color
  }
  if (config.width) {
    newSquare.area = config.width * config.width
  }
  return newSquare
}
```

## 只读属性
**1. readonly** 
一些对象属性只能在对象刚刚创建的时候修改其值。 你可以在属性名前用 readonly 来指定只读属性
```typescript
interface Point {
  readonly x: number
  readonly y: number
}
let p1:Point = {x:10,y:20}
p1.x = 5   // Error 只读属性只在该类型创建的时候被定义，后面不能修改
```
**2. ReadonlyArray&lt;T&gt;**
+ TypeScript 具有 ReadonlyArray&lt;T&gt; 类型，它与 Array&lt;T&gt; 相似，只是把所有可变方法去掉了，因此可以确保数组创建后再也不能被修改：即数组元素不能被修改，数组的长度也不能被修改
+ 实践环节:
```typescript
let a: number[] = [1, 2, 3, 4]
let ro: ReadonlyArray<number> = a
ro[0] = 12 // error!
ro.push(5) // error!
ro.length = 100 // error!
a = ro // error!
let b:ReadonlyArray<number> = ro // 正确
```
+ 上面代码的最后一行，可以看到就算把整个 ReadonlyArray 赋值到一个普通数组也是不可以的。 但是你可以用类型断言重写：原因是因为ro和a的类型不一样，假如创建一个和ro类型一样的数组就能赋值
```typescript
a = ro as number[]
```
**3. readonly和const**
+ 最简单判断该用 readonly 还是 const 的方法是看要把它做为变量使用还是做为一个属性。 做为变量使用的话用 const，若做为属性则使用 readonly

## 额外的属性检查
**1. 什么是额外的属性检查？**
```typescript
interface Square {
  color: string
  area: number
}
interface SquareConfig {
  color?:string             // 属性后面加?表示可选属性
  width?: number
}
function createSquare(config:SquareConfig):Square {         
  let newSquare = {color: 'white', area: 100}
  if (config.color) {
    newSquare.color = config.color
  }
  if (config.width) {
    newSquare.area = config.width * config.width
  }
  return newSquare
}

let mySquare = createSquare({col:'black',width:100})       // 出现额外的属性检查的地方，会出错，
```
注意我们上面代码的最后一行，当我们以对象字面量的方式去传入参数，typescript就会认为col这个属性不在我们定义的接口SquareConfig中，会报错但是实际上接口SquareConfig要表达的意思应该是除了color和width，其他的属性也可以存在
**2. 解决方法**
+ **类型断言** -> 绕开额外的属性检查
```typescript
let mySquare = createSquare({col:'black',width:100} as SquareConfig)
```
+ **变量名代替对象字面量**  -> 绕开额外的属性检查
```typescript
let squareOptions = { col:'black',width:100 }
let mySquare = createSquare(squareOptions)
```
+ **最好的解决方案：字符串索引签名** -> 通过额外的属性检查
字符串索引签名是修改接口，让它真正实现接口的意义，就是除了color和width，还可以有其他任意数量和类型的属性,如下代码
```typescript
interface SquareConfig {
  color?:string    
  width?: number
  [propName:string]:any   // 表示SquareConfig中还能包含任何string类型的属性，这些属性的值可以是任何any类型
}
```
使用了字符串索引签名，对象字面量的方式就不会报错，因为额外的属性检查还在，但是我们通过了检查，而不是绕开了检查
  
## 函数类型
1. 接口能够描述 JavaScript 中对象拥有的各种各样的外形。 除了描述带有属性的普通对象外，接口也可以描述函数类型。
2. 为了使用接口表示函数类型，我们需要给接口定义一个调用签名。它就像是一个只有参数列表和返回值类型的函数定义。参数列表里的每个参数都需要名字和类型。
```typescript
interface SearchFunc {
  (source:string,subString:string):boolean     // (参数类型):返回值类型
}
```
3. 这样定义后，我们可以像使用其它接口一样使用这个函数类型的接口。 下例展示了如何创建一个函数类型的变量，并将一个同类型的函数赋值给这个变量。
```typescript
let mySeach: SearchFunc = function(src:string,sub:string):boolean {
  return false
}
**这里特别要注意，真正函数中的参数名称可以和接口中不一样，只要保证数量和类型,还有返回值类型完全匹配即可，可以像下面这样简写
let mySeach: SearchFunc
mySeach  = function(src,sub) { ... }
```
    
## 可索引的类型
**1. 什么是可索引的类型** 
可索引的类型就是告诉我们接口中所有的属性和属性值的规则和类型的集合，比如 [propName:string]:any表示属性必须都是string类型，属性值可以是任何类型

**2. 数字索引**
与使用接口描述函数类型差不多，我们也可以描述那些能够“通过索引得到”的类型，比如 a[10] 或 ageMap['daniel']。 可索引类型具有一个 索引签名，它描述了对象索引的类型，还有相应的索引返回值类型。
```typescript
interface StringArray {
  [index: number]: string       // 索引签名
}
let myArray: StringArray
myArray = ['Bob', 'Fred']
let myStr: string = myArray[0]
```
上面例子里，我们定义了 StringArray 接口，它具有索引签名。 这个索引签名表示了当用number去索引StringArray时会得到string类型的返回值。

**3. 字符串索引**
+ TypeScript 支持两种索引签名：字符串和数字。 可以同时使用两种类型的索引，但是数字索引的返回值必须是字符串索引返回值类型的子类型。 这是因为当使用 number 来索引时，JavaScript 会将它转换成string 然后再去索引对象。 也就是说用 100（一个 number）去索引等同于使用'100'（一个 string ）去索引，因此两者需要保持一致。
```typescript
class Animal {
  name: string
}
class Dog extends Animal {
  breed: string
}
// 错误：使用数值型的字符串索引，有时会得到完全不同的Animal!
interface NotOkay {
  [x: number]: Animal     // number索引签名的返回值是Animal，不是Dog的子集，所以错误
  [x: string]: Dog
}
```
综上所述，凡是number的索引签名的返回值必须是string的索引签名的子集或者同级
+ 字符串索引签名能够很好的描述 dictionary 模式，并且它们也会确保所有属性与其返回值类型相匹配。 因为字符串索引声明了 obj.property 和 obj['property'] 两种形式都可以。 下面的例子里， name 的类型与字符串索引类型不匹配，所以类型检查器给出一个错误提示：
```typescript
interface NumberDictionary {
  [index: string]: number; // 表示在实现接口的对象中必须所有的属性值都是number类型的
  length: number;    // 可以，length是number类型
  name: string       // 错误，`name`的类型与索引类型返回值的类型不匹配
}
```
+ 最后，你可以将索引签名设置为只读，这样就防止了给索引赋值：
```typescript
interface NumberDictionary {
  readonly [x:string]:number
}
let num:NumberDictionary = {'str':1,'str1':2}
num.str = 10; // error!
```

## 类类型
1. 与 C# 或 Java 里接口的基本作用一样，TypeScript 也能够用它来明确的强制一个类去符合某种契约
```typescript
interface ClockInterface {             
  currentTime: Date
  setTime(d: Date)
}
class Clock implements ClockInterface {      // 类Clock要去实现接口
  currentTime: Date                          // 实例的类型
  setTime(d: Date) {                         // 实例的类型
    this.currentTime = d
  }
  constructor(h: number, m: number) { }      // 静态部分的类型
}
```
2. 接口描述了类的公共部分，而不是公共和私有两部分。 它不会帮你检查类是否具有某些私有成员
3. 当你操作类和接口的时候，你要知道**类是具有两个类型的：静态部分的类型和实例的类型**。像上述部分中的currentTime属性和setTime函数就是实例的类型，而构造函数是静态的类型，你会注意到，当你用构造器签名去定义一个接口并试图定义一个类去实现这个接口时会得到一个错误：
```typescript
interface ClockConstructor {
  new (hour: number, minute: number)
}
// error
class Clock implements ClockConstructor {
  currentTime: Date
  constructor(h: number, m: number) { }
}
```
这里因为当一个类实现了一个接口时，只对其实例部分进行类型检查。constructor 存在于类的静态部分，所以不在检查的范围内。

4. 所以通常和类相关的就是实例接口和构造器接口，上面的ClockInterface就是个实例接口，而ClockConstructor是构造器接口
```typescript
interface ClockConstructor {                               // 构造器接口，返回的是ClockInterface实例接口类型
  new (hour: number, minute: number): ClockInterface
}
interface ClockInterface {                                 // 实例接口
  tick()
}
// 工厂方法：ctor准确说是一个类的名称，或者说类的类型，这个类必须满足ClockConstructor接口的条件，而ClockConstructor接口的条件是返回ClockInterface，通俗的说就是这个类要能实现ClockInterface而DigitalClock实现了ClockInterface，所以可以作为参数传入，new ctor(hour, minute)最终执行的时候执行的就是 new DigitalClock(hour, minute)
function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
  return new ctor(hour, minute)
}
class DigitalClock implements ClockInterface {
  constructor(h: number, m: number) { }
  tick() {
    console.log('beep beep')
  }
}
class AnalogClock implements ClockInterface {
  constructor(h: number, m: number) { }
  tick() {
    console.log('tick tock')
  }
}
let digital = createClock(DigitalClock, 12, 17)
let analog = createClock(AnalogClock, 7, 32)
```

## 继承接口
1. 和类一样，接口也可以相互继承。 这让我们能够从一个接口里复制成员到另一个接口里，可以更灵活地将接口分割到可重用的模块里
2. 一个接口可以继承多个接口，创建出多个接口的合成接口。
```typescript
interface Shape {
  color: string
}
interface PenStroke {
  penWidth: number
}
interface Square extends Shape, PenStroke {  
  sideLength: number
}
let square = {} as Square  // 经过类型断言，这个本来为空的对象就有了color、sideLength和penWidth这三个属性
square.color = 'blue'
square.sideLength = 10
square.penWidth = 5.0
```

## 混合类型
1. 先前我们提过，接口能够描述 JavaScript 里丰富的类型。 因为 JavaScript 其动态灵活的特点，有时你会希望一个对象可以同时具有上面提到的多种类型。一个例子就是，一个对象可以同时做为函数和对象使用，并带有额外的属性。
```typescript
interface Counter {
  (start:number):string    // 函数签名，表示实现了Counter这个类型的东西可以作为函数去使用
  interval:number          // 实现了Counter这个接口的东西也能作为对象使用，拥有属性interval和reset
  reset():void
}
function getCounter():Counter{
  let couter = (function(start:number){
    console.log(start + 1)
  }) as Counter  //将couter强制断言为Counter接口类型，使其拥有interval和reset
  couter.interval = 123
  couter.reset = function() {
    couter.interval = 234
  }
  return couter
}

let c =getCounter()
c(10)   //11
c.reset()
console.log(c.interval)  //234
```
2. 混合类型挺有作用的，在封装过程中用处很大

## 接口继承类
1. 当接口继承了一个类类型时，它会继承类的成员但不包括其实现。 就好像接口声明了所有类中存在的成员，但并没有提供具体实现一样。
2. 接口同样会继承到类的 private 和 protected 成员。 这意味着当你创建了一个接口继承了一个拥有私有或受保护的成员的类时，这个接口类型只能被这个类或其子类所实现（implement）。
3. 当你有一个庞大的继承结构时这很有用，但要指出的是你的代码只在子类拥有特定属性时起作用。 这个子类除了继承至基类外与基类没有任何关系。例：
```typescript
class Control {                                             // 基类
  private state: any
}
interface SelectableControl extends Control {               // 接口继承了基类，拿到了state这个私有变量
  select(): void
}
class Button extends Control implements SelectableControl { // 子类先继承基类拿到state，然后实现接口，就能实现接口中的state
  select() { }
}
class TextBox extends Control {                             // 子类没有实现接口也能自己定义方法
  select() { }
}
// Error：“ImageC”类型缺少“state”属性。
class ImageC implements SelectableControl {                 // ImageC由于没有继承父类，没有state，故不能实现接口中的state
  select() { }
}
```
4. 在上面的例子里，SelectableControl 包含了 Control 的所有成员，包括私有成员 state。 因为 state 是私有成员，所以只能够是Control 的子类们才能实现 SelectableControl 接口。 因为只有 Control 的子类才能够拥有一个声明于Control 的私有成员 state，这对私有成员的兼容性是必需的。
5. 在 Control 类内部，是允许通过 SelectableControl 的实例来访问私有成员 state 的。 实际上，SelectableControl 接口和拥有 select 方法的 Control 类是一样的。Button和 TextBox 类是 SelectableControl 的子类（因为它们都继承自Control 并有 select 方法）但 ImageC 类并不是这样的。
6. 这里其实很好理解，因为**extends是继承**的意思，就是你的能变成我的，而**implements理解为实现**，意思就是你的东西我都有我才能实现你(现在再去理解imageC和Button就很容易了)
