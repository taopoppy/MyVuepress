# 泛型

软件工程中，我们不仅要创建定义良好且一致的 API，同时也要考虑可重用性。 组件不仅能够支持当前的数据类型，同时也能支持未来的数据类型，这在创建大型系统时为你提供了十分灵活的功能。在像 C# 和 Java 这样的语言中，可以使用泛型来创建可重用的组件，一个组件可以支持多种类型的数据。 这样用户就可以以自己的数据类型来使用组件。

## 基本示例
1. 当我们想写一个输入类型和返回类型一致的函数，我们可能会写使用any，但是any表示任何类型，不能表现出类型之间的关系,这个时候我们就需要泛型
```typescript
function identity<T> (arg:T): T {
  return arg
}
```
2. 我们定义了泛型函数后，可以用两种方法使用。 
+ 第一种是，传入所有的参数，包含类型参数,这里我们明确的指定了 T 是 string 类型，并做为一个参数传给函数，使用了 <> 括起来而不是 ()。
```typescript
let output = identity<string>('myString')
```
+ 第二种方法更普遍。利用了类型推论 -- 即编译器会根据传入的参数自动地帮助我们确定 T 的类型：
```typescript
let output = identity('myString')     // 会自动判断T的类型为string
```

## 泛型变量
1. 使用泛型创建像 identity 这样的泛型函数时，编译器要求你在函数体必须正确的使用这个通用的类型。 换句话说，你必须把这些参数当做是任意或所有类型。
2. 我们下面的例子是要打印参数的长度，这个.length方法只能用在数组或者字符串，不能用于所有类型，所以在泛型身上使用特殊方法会报错
```typescript
function identity<T> (arg:T): T {
  console.log(arg.length)   // 这里会提示你T类型上不存在length
  return arg
}
```
  
## 泛型类型
1. 泛型函数的类型与非泛型函数的类型没什么不同，只是有一个类型参数在最前面，像函数声明一样：
```typescript
let myIdentity: <T>(arg: T)=>T = identity
```
2. 我们还可以使用带有调用签名的对象字面量来定义泛型函数：
```typescript
let myIdentity: {<T>(arg: T): T} = identity
```
  
## 泛型接口
1. 我们甚至可以把泛型参数当作整个接口的一个参数。 这样我们就能清楚的知道使用的具体是哪个泛型类型（比如： Dictionary&lt;string&gt; 而不只是Dictionary）。这样接口里的其它成员也能知道这个参数的类型了。
```typescript
interface GenericIdentityFn<T> { // 泛型接口: 这种写法是将非泛型类型作为泛型当中的一部分，因为原来的写法是：interface GenericIdentityFn { <T>(arg: T): T}
  (arg: T): T
}
function identity<T>(arg: T): T {
  return arg
}
let myIdentity: GenericIdentityFn<number> = identity    // 现在将number做为参数能够传给函数，明确泛型的类型
```


## 泛型类
1. 泛型类看上去与泛型接口差不多。 泛型类使用&lt;&gt;括起泛型类型，跟在类名后面。
```typescript
class GenericNumber<T> {
  zeroValue: T
  add: (x:T,y:T) => T
}
let myGenericNumber = new GenericNumber<number>()
myGenericNumber.zeroValue = 0
myGenericNumber.add = function(x,y) {
  return x + y
}
```
2. 我们在类那节说过，类有两部分：静态部分和实例部分。 **泛型类指的是实例部分的类型，所以类的静态属性不能使用这个泛型类型**。
```typescript
class GenericNumber<T> {
  static nameValue: T      // error,这里会提示，静态成员不能使用类类型参数
  zeroValue: T
  add: (x:T,y:T) => T
}
```

## 泛型约束
1. 相比于操作 any 所有类型，我们想要限制函数去处理任意带有 .length 属性的所有类型。 只要传入的类型有这个属性，我们就允许，就是说至少包含这一属性。为此，我们需要列出对于 T 的约束要求。
2. 我们定义一个接口来描述约束条件，创建一个包含 .length 属性的接口，使用这个接口和 extends 关键字来实现约束：
```typescript
interface Lengthwise {
  length: number
}
function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)            // OK,因为这里对T类型做了约束，你传来的类型必须含有length这个属性
  return arg
}
```
3. 现在这个泛型函数被定义了约束，因此它不再是适用于任意类型：
```typescript
loggingIdentity({length:9,sex:'man'}) // ok，这个对象本身定义了length这个属性
loggingIdentity(3)    // error，数字没有.length这个属性
loggingIdentity('taopoppy') // ok,字符串有.length这个属性
```

## 在泛型约束中使用类型参数
1. 你可以声明一个类型参数，且它被另一个类型参数所约束。 比如，现在我们想要用属性名从对象里获取这个属性。 并且我们想要确保这个属性存在于对象 obj 上，因此我们需要在这两个类型之间使用约束。
```typescript
function getProperty<T, K extends keyof T> (obj: T, key: K ) {
  return obj[key]
}

let x = {a: 1, b: 2, c: 3, d: 4}

getProperty(x, 'a') // okay
getProperty(x, 'm') // error
```

## 最后写一个很复杂的例子
1. 想要理解这个例子，必须先要看懂接口/类类型/(4)那个[例子](https://www.taopoppy.cn/typescript-axios/basis_interface.html#%E7%B1%BB%E7%B1%BB%E5%9E%8B)
```typescript
class BeeKeeper {    // 蜜蜂管理员
  hasMask:boolean
}
class LionKeeper {  // 狮子管理员
  nameTag:string
}
class Animal {    // 动物类
  numLengs:number
}
class Bee extends Animal {  // 蜜蜂类
  keeper:BeeKeeper
}
class Lion extends Animal { // 狮子类
  keeper: LionKeeper
}
interface InAnimal<T> {   // 构造器接口
  new():T
}

// 工厂函数: 
function createInstance <T extends Animal>(animalType:InAnimal<T>):T {
  return new animalType()
}
createInstance(Lion).keeper.nameTag
createInstance(Bee).keeper.hasMask
```