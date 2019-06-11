# 基础类型
## 布尔值
1. 最基本的数据类型就是简单的 true/false 值，在JavaScript 和 TypeScript 里叫做 boolean（其它语言中也一样）。
```typescript
let isDone: boolean = false
```
 
## 数字
1. 和 JavaScript 一样，TypeScript 里的所有数字都是浮点数。 这些浮点数的类型是 number。 除了支持十进制和十六进制字面量，TypeScript 还支持 ECMAScript 2015中引入的二进制和八进制字面量。
```typescript
let decLiteral: number = 20
let hexLiteral: number = 0x14
let binaryLiteral: number = 0b10100
let octalLiteral: number = 0o24
```

## 字符串
1. JavaScript 程序的另一项基本操作是处理网页或服务器端的文本数据。 像其它语言里一样，我们使用 string 表示文本数据类型。和 JavaScript 一样，可以使用双引号（"）或单引号（'）表示字符串。
```typescript
let name: string = 'bob'
name = 'smith'
```
**注意这里有个很重要的点就是一般声明name为变量会报错**，具体原理我们参考下面的网址：[https://www.jianshu.com/p/78268bd9af0a](https://www.jianshu.com/p/78268bd9af0a)
2. 你还可以使用模版字符串，它可以定义多行文本和内嵌表达式。 这种字符串是被反引号包围（ `），并且以 ${ expr } 这种形式嵌入表达式
```typescript
let name: string = `Yee`
let age: number = 37
let sentence: string = `Hello, my name is ${ name }.
I'll be ${ age + 1 } years old next month.`
```

## 数组
1. TypeScript 像 JavaScript 一样可以操作数组元素。 有两种方式可以定义数组。 第一种，可以在元素类型后面接上 []，表示由此类型元素组成的一个数组：
```typescript
let list: number[] = [1, 2, 3]
```
2. 第二种方式是使用数组泛型，Array<元素类型>：
```typescript
let list: Array<number> = [1, 2, 3]
```

## 元组 Tuple
1. 元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同。 比如，你可以定义一对值分别为 string 和 number 类型的元组。
```typescript
let x: [string, number]
x = ['hello', 10] // OK
x = [10, 'hello'] // Error
```
2. 当访问一个已知索引的元素，会得到正确的类型：
```typescript
console.log(x[0].substr(1))  // OK
console.log(x[1].substr(1))  // Error, 'number' 不存在 'substr' 方法
```
3. 当访问一个越界的元素，会使用联合类型替代：
```typescript
x[3] = 'world'               // OK, 字符串可以赋值给(string | number)类型
console.log(x[5].toString()) // OK, 'string' 和 'number' 都有 toString
x[6] = true                  // Error, 布尔不是(string | number)类型
``` 
4. 联合类型是高级主题，我们会在以后的章节里讨论它。
      (注意：自从 TyeScript 3.1 版本之后，访问越界元素会报错，我们不应该再使用该特性)

## 枚举
1. enum 类型是对 JavaScript 标准数据类型的一个补充。 像 C# 等其它语言一样，使用枚举类型可以为一组数值赋予友好的名字。
```typescript
enum Color {Red, Green, Blue}
let c: Color = Color.Green
```
2. 默认情况下，从 0 开始为元素编号。 你也可以手动的指定成员的数值。 例如，我们将上面的例子改成从 1 开始编号：
```typescript
enum Color {Red = 1, Green, Blue}
let c: Color = Color.Green
```
3. 或者，全部都采用手动赋值：
```typescript
enum Color {Red = 1, Green = 2, Blue = 4}
let c: Color = Color.Green
```
4. 枚举类型提供的一个便利是你可以由枚举的值得到它的名字。 例如，我们知道数值为 2，但是不确定它映射到 Color 里的哪个名字，我们可以查找相应的名字：
```typescript
enum Color {Red = 1, Green, Blue}
let colorName: string = Color[2]
console.log(colorName)             // 显示'Green'因为上面代码里它的值是2
```
5. **从上面看出实际上枚举是一种映射关系,但是我们要看清楚映射的本质实际上是一种key和value互换的对象形式**，解析成为js是下面这样
```typescript
enum Color {Red = 1, Green, Blue}    =>      var Color;
                                              (function (Color) {
                                                  Color[Color["Red"] = 1] = "Red";
                                                  Color[Color["Green"] = 2] = "Green";
                                                  Color[Color["Blue"] = 3] = "Blue";
                                              })(Color || (Color = {}));
```
是通过一个立即执行函数去创建以Color对象，在明白Color["Red"] = 1的返回值是1这种语句后我们就能明白Color[Color["Red"] = 1] = "Red"实际上有两步
+ 第一步: Color["Red"] = 1，
+ 第二步: Color[1] = "Red"所以Color对象的内容就是: Color:{ '1': 'Red', '2': 'Green', '3': 'Blue', Red: 1, Green: 2, Blue: 3 }
所以映射关系是这样存在的，并不是什么高深的技术，就是key-value的一一对应
    
## any
1. 有时候，我们会想要为那些在编程阶段还不清楚类型的变量指定一个类型。 这些值可能来自于动态的内容，比如来自用户输入或第三方代码库。 这种情况下，我们不希望类型检查器对这些值进行检查而是直接让它们通过编译阶段的检查。 那么我们可以使用 any 类型来标记这些变量：
```typescript
let notSure: any = 4
notSure = 'maybe a string instead'
notSure = false // 也可以是个 boolean
```
2. 在对现有代码进行改写的时候，any 类型是十分有用的，它允许你在编译时可选择地包含或移除类型检查。并且当你只知道一部分数据的类型时，any 类型也是有用的。 比如，你有一个数组，它包含了不同的类型的数据：
```typescript
let list: any[] = [1, true, 'free']
list[1] = 100
```
3. 特别要注意，我们不能滥用any，因为任何类型都用any，typescript使用就没有意义了
  
## void
1. 某种程度上来说，void 类型像是与 any 类型相反，它表示没有任何类型。 当一个函数没有返回值时，你通常会见到其返回值类型是 void：
```typescript
function warnUser(): void {
  console.log('This is my warning message')
}
```
2. 声明一个 void 类型的变量没有什么大用，因为你只能为它赋予 undefined 和 null：
```typescript
let unusable: void = undefined
```
  
## null 和 undefined
1. TypeScript 里，undefined 和 null 两者各自有自己的类型分别叫做 undefined 和 null。 和 void 相似，它们的本身的类型用处不是很大：
```typescript
let u: undefined = undefined
let n: null = null
``` 
2. **默认情况下 null 和 undefined 是所有类型的子类型**。 子类型可以赋值给父类型，就是说你可以把 null 和 undefined 赋值给 number 类型的变量。
3. 然而，当你指定了 **--strictNullChecks 标记**，也就是说编译的使用带这个后缀，tsc index.ts  --strictNullChecks null 和 undefined 只能赋值给 void 和它们各自，不能再赋值给父类型，比如说number和string这种父类型，这能避免 很多常见的问题。
4. 也许在某处你想传入一个 string 或 null 或 undefined，你可以使用联合类型 string | null | undefined。 再次说明，稍后我们会介绍联合类型。

## never
1. never 类型表示的是那些永不存在的值的类型。 例如， never 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型；变量也可能是 never 类型，当它们被永不为真的类型保护所约束时。
2. **never 类型是任何类型的子类型，也可以赋值给任何类型；然而，没有类型是 never 的子类型或可以赋值给never 类型（除了 never 本身之外）。 即使 any 也不可以赋值给 never**。
3. 下面是一些返回 never 类型的函数：
```typescript
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
  throw new Error(message)
}

// 推断的返回值类型为never
function fail() {
  return error("Something failed")
}

// 返回never的函数必须存在无法达到的终点
function infiniteLoop(): never {
  while (true) {
  }
}
```
  
## object
1. object 表示非原始类型，也就是除 number，string，boolean，symbol，null或undefined 之外的类型。
2. 使用 object 类型，就可以更好的表示像 Object.create 这样的 API。例如：
```typescript
declare function create(o: object | null): void
create({ prop: 0 }) // OK
create(null) // OK

create(42) // Error
create('string') // Error
create(false) // Error
create(undefined) // Error
```

## 类型断言
1. 有时候你会遇到这样的情况，你会比 TypeScript 更了解某个值的详细信息。 通常这会发生在你清楚地知道一个实体具有比它现有类型更确切的类型。通过类型断言这种方式可以告诉编译器，“相信我，我知道自己在干什么”。 类型断言好比其它语言里的类型转换，但是不进行特殊的数据检查和解构。 它没有运行时的影响，只是在编译阶段起作用。 TypeScript 会假设你，程序员，已经进行了必须的检查。
2. 类型断言有两种形式。 
+ 其一是“尖括号”语法：
```typescript
let someValue: any = 'this is a string'
let strLength: number = (<string>someValue).length  // 我告诉编译器它真的就是string类型，而且编译器编译的时候也发现就是string类型
```
        
但是要明确的就是**类型断言不等于强制类型转换**，类型断言是这个东西就是这个类型，我断言后就能使用相对应的方法，编辑器也会提示，比如.length这个方法，你要不断言，编辑器就没有提示，你断言了，编辑器就知道这是个string类型，就能提示string类型所有的方法和属性，但是你要断言错了，比如someValue是个数字，你此时即使断言了并且使用.length方法，结果也是undefined，因为数字就没有.length方法，ts编译后someValue依旧是数字，并没有强制转换成为字符串，所以要区分类型断言和强制类型转化这两个不同的概念

+ 另一个为 as 语法：
```typescript
let someValue: any = 'this is a string'
let strLength: number = (someValue as string).length
```
两种形式是等价的。 至于使用哪个大多数情况下是凭个人喜好；然而，当你在 TypeScript 里使用 JSX 时，只有 as 语法断言是被允许的。另外使用as能更好帮助我们理解，这里可以理解为: someValue作为string来使用