# 变量声明
let 和 const 是 JavaScript 里相对较新的变量声明方式。let 在很多方面与 var 是相似的，但是可以帮助大家避免在 JavaScript 里常见一些问题。const 是对 let 的一个增强，它能阻止对一个变量再次赋值。因为 TypeScript 是 JavaScript 的超集，所以它本身就支持 let 和 const。 下面我们会详细说明这些新的声明方式以及为什么推荐使用它们来代替 var。
## var声明
**1. 第一个作用域的例子**
+ 作用域规则：var 声明有些奇怪的作用域规则。 看下面的例子：
```typescript
function f(shouldInitialize) {                    function f(shouldInitialize) {
  if (shouldInitialize) {                            var shouldInitialize = undefined,x = undefined
    var x = 10                           =>          if(shouldInitialize){
  }                                                     x = 10
  return x                                           }
}
f(true)  // returns '10'
f(false) // returns 'undefined'
```
+ 有些同学可能要多看几遍这个例子。 变量 x 是定义在 if 语句里面，但是我们却可以在语句的外面访问它。 这是因为 var 声明的作用域是函数作用域，函数参数也使用函数作用域。
    
**2. 第二个for循环和异步的例子**
+ 下面的结果是输出10个10，按理我们想要的结果应该是从0到10
```typescript
for (var i = 0; i < 10; i++) {
  setTimeout(function() {
    console.log(i)
  }, 100 * i)
}
```
+ 产生这样结果的原因就是:
(1)异步函数是在主线程完成后去执行的，所以只有10次循环完毕后我们才去执行10个setTimeout
(2)因为不存在块级作用域，所以for申明的i实际上在for的外部，而10次for的迭代都用的是同一个i，后面10个setTimeout用的都是同一个i
+ 解决方法:
(1)、在for循环中使用立即执行函数:**但是要注意的是，立即执行函数并没有将异步改变为同步，而是将不同i的值传个了10个setTimeout.(2)、使用let代替var
```typescript
for (var i = 0; i < 10; i++) {
  (function(i) {
    setTimeout(function() {
      console.log(i)
    }, 100 * i)
  })(i)
}
```

  
## let
**1. 块作用域和暂时性死区**
+ 当用 let 声明一个变量，它使用的是块作用域。 不同于使用 var 声明的变量那样可以在包含它们的函数外访问，块作用域变量在包含它们的块或 for 循环之外是不能访问的。
```typescript
function f(input: boolean) {
  let a = 100

  if (input) {
    // OK: 仍然能访问到 a
    let b = a + 1
    return b
  }

  // Error: 'b' 在这里不存在
  return b
}
```
+ 拥有块级作用域的变量的另一个特点是，它们不能在被声明之前读或写(通俗的说let是不会去做变量提升的)。 虽然这些变量始终“存在”于它们的作用域里，但在直到声明它的代码之前的区域都属于暂时性死区。 它只是用来说明我们不能在 let 语句之前访问它们，幸运的是 TypeScript 可以告诉我们这些信息。
+ 但是特别要主要的是我们普通编译时将ts编译成为es5，但是如果是加上参数 --target es2015，就会将ts编译成为es6，所以let的书写顺序就很重要
```typescript
function f() {
  return a
}
f()
let a = 10
```
上面这段代码编译成为es5没有问题，因为会将let编译成为var，var会变量提升，但是编译成为es6，let如果在f()后面就会报错，因为在f()中之前找不到a

**2. 重定义及屏蔽**
+ let不允许在重复声明，准确的说，let不允许在相同的块级作用域当中去重复申明
+ 在一个嵌套作用域里引入一个新名字的行为称做屏蔽,也就说两层循环都使用let i做声明，内层的i会屏蔽掉外层的i
+ 块级作用域变量的获取,循环中let的不同行为: let针对每次迭代都会创建这样一个新作用域,也就是说循环10次，每一次都是一个新的作用域，可想而知，10次当中的块级作用域变量i根本不是同一个东西，所以let可以完全取代var和立即执行函数去正确运行循环中的异步代码


## const
+ const 声明是声明变量的另一种方式。
```typescript
const numLivesForCat = 9
```
+ 它们与 let 声明相似，但是就像它的名字所表达的，它们被赋值后不能再改变。 换句话说，它们拥有与 let 相同的作用域规则，但是不能对它们重新赋值。这很好理解，它们引用的值是不可变的。
+ **特别要注意的是const声明对象的时候，对象内部的属性可以变化，但是对象不能变**
```typescript
const numLivesForCat = 9
const kitty = {
  name: 'Kitty',
  numLives: numLivesForCat
}

// Error
kitty = {
  name: 'Tommy',
  numLives: numLivesForCat
};

// OK
kitty.name = 'Jerry'
kitty.numLives--
``` 
+ 现在我们有两种作用域相似的声明方式，我们自然会问到底应该使用哪个。与大多数泛泛的问题一样，答案是：依情况而定。**使用最小特权原则**，所有变量除了你计划去修改的都应该使用 const。 基本原则就是如果一个变量不需要对它写入，那么其它使用这些代码的人也不能够写入它们，并且要思考为什么会需要对这些变量重新赋值。使用 const 也可以让我们更容易的推测数据的流动。

## 解构
**1. 解构是一种变量声明的语法糖，分为对象解构和数组解构**

**2. 数组解构**
+ 将已知的数组解构，用自己声明的名称代替数组下标形式，这种一般和元组会结合使用
```typescript
let input:[number,number] = [1, 2]
function f([first,second]:[number,number]){
  console.log(first + second)
}
f(input)
```
+ 还能像下面这样去只拿到你需要的东西
```typescript
let [first, ...rest] = [1, 2, 3, 4]
console.log(first) // outputs 1
console.log(rest) // outputs [ 2, 3, 4 ]
```
+ 解构编译的过程:通过解构为什么我们能根据自己设置的名称拿到变量，我们可以简单看一下解析后的js文件，其实就是用你的名称去设置创建变量，并将相应位置的元素赋值给这个变量而已
```typescript
let [first, ...rest] = [1, 2, 3, 4]                              // ts文件
var _a = [1, 2, 3, 4], first = _a[0], rest = _a.slice(1);        // js文件
```

**3. 对象解构**
+ 对象解构的一般方式:
```typescript
let o = {
    a: 'foo',
    b: 12,
    c: 'bar'
}
let { a, b}: {a:string,b:number} = o                          // 通过a, b就能拿到o.a,o.b
let {a, ...pastthrough}:{a:string,b:number,c:string} = o      // 通过a可以拿到o.a,通过pastthrough可以拿到除了a以外所有o对象属性的集合，实际上也是个对象
```

**4. 默认值**
+ 默认值可以让你在属性为 undefined 时使用缺省值：就是说b?:number表示这个值可有可没有
+ let {a,b=1000} = obj表示如果没有b，b的默认值就是1000，b有值就会覆盖1000
```typescript
function keepWholeObject(wholeObject : { a: string, b?: number }) : void {
  let { a, b = 1001 } = wholeObject
  console.log(a,b)
}
// 另一种写法: 直接在参数的地方进行解构
function keepWholeObject( { a, b = 1001 } : {a: string, b?: number}) : void {
  console.log(a,b)
}
```
+ **综合实例**
```typescript
function f({a,b=1001}:{a:string,b?:number} = {a:'poppy',b:999}):void {
  console.log(a,b)
}
```
上面的这个首先表示你可以传参数，不传参数默认就有{a:'poppy',b:999}这样的默认对象传入，如果你要传参数，你传的参数是个对象，而且对象中必须有a这个属性，b可以没有，如果b没有默认往你传的参数中添加b这个属性，属性的值为1001

## 展开
**1. 数组的展开**
```typescript
let first = [1, 2]
let second = [3, 4]
let bothPlus = [0, ...first, ...second, 5]
```
这会令 bothPlus 的值为 [0, 1, 2, 3, 4, 5]。 展开操作创建了 first 和 second的 一份浅拷贝。 它们不会被展开操作所改变。

**2. 对象的展开**：
```typescript
let defaults = { food: 'spicy', price: '$10', ambiance: 'noisy' }
let search = { ...defaults, food: 'rich' }
```
search的值为 <code>{ food: 'rich', price: '$10', ambiance: 'noisy' }</code>。 对象的展开比数组的展开要复杂的多。像数组展开一样，它是从左至右进行处理，但结果仍为对象。这就意味着出现在展开对象后面的属性会覆盖前面的属性。因此，如果我们修改上面的例子，在结尾处进行展开的话：
```typescript
let defaults = { food: 'spicy', price: '$10', ambiance: 'noisy' }
let search = { food: 'rich', ...defaults }
```
那么，defaults 里的 food 属性会重写 food: 'rich'，在这里这并不是我们想要的结果,所以我们要对对象展开的时候要注意顺序的问题