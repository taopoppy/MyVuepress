# 函数
函数是 JavaScript 应用程序的基础，它帮助你实现抽象层，模拟类，信息隐藏和模块。在 TypeScript 里，虽然已经支持类，命名空间和模块，但函数仍然是主要的定义行为的地方。TypeScript 为 JavaScript 函数添加了额外的功能，让我们可以更容易地使用
  
## 书写完整函数类型
1. 函数类型包含两部分：**参数类型**和**返回值类型**。 当写出完整函数类型的时候，这两部分都是需要的。 我们以参数列表的形式写出参数类型，为每个参数指定一个名字和类型。这个名字只是为了增加可读性。 下面有两种书写的方法
```typescript
// 第一种写法：
let myAdd: (x: number, y: number) => number =        // (x:number,y:number) => number  这个作为一个整体代表一个函数类型
function(x: number, y: number): number {
  return x + y
}
// 第二种写法
let myAdd: (baseValue: number, increment: number) => number = 
function(x: number, y: number): number {
  return x + y
}
```
**只要参数类型是匹配的，那么就认为它是有效的函数类型，而不在乎参数名是否正确**。
2. 第二部分是返回值类型。 对于返回值，我们在函数和返回值类型之前使用(=>)符号，使之清晰明了。 如之前提到的，返回值类型是函数类型的必要部分，如果函数没有返回任何值，你也必须指定返回值类型为 void 而不能留空。
  
## 推断类型
1. 尝试这个例子的时候，你会发现如果你在赋值语句的一边指定了类型但是另一边没有类型的话，TypeScript 编译器会自动识别出类型：
```typescript
let myAdd = function(x: number, y: number): number {     
  return x + y                                                       // 个人推荐
}

let myAdd: (baseValue: number, increment: number) => number = 
function(x, y) {
  return x + y
}
```
2. 这叫做“按上下文归类”，是类型推论的一种。它帮助我们更好地为程序指定类型。
3. 所以我个人比较喜欢第一种写法，在赋值表达式的右边写上函数类型会更容易理解

## 可选参数
1. TypeScript 里的每个函数参数都是必须的。 这不是指不能传递 null 或 undefined 作为参数，而是说编译器检查用户是否为每个参数都传入了值。编译器还会假设只有这些参数会被传递进函数。 简短地说，传递给一个函数的参数个数必须与函数期望的参数个数一致。
2. JavaScript 里，每个参数都是可选的，可传可不传。 没传参的时候，它的值就是 undefined。 在TypeScript 里我们可以在参数名旁使用 ? 实现可选参数的功能。 比如，我们想让 lastName 是可选的：
3. **可选参数必须跟在必须参数后面**
```typescript
function buildName(firstName: string, lastName?: string): string {
  if (lastName)
    return firstName + ' ' + lastName
  else
    return firstName
}
let result1 = buildName('Bob');                 // OK
let result2 = buildName('Bob', 'Adams', 'Sr.')  // Error, 参数过多
let result3 = buildName('Bob', 'Adams')         // OK
```
  
## 默认参数
1. TypeScript 里，我们也可以为参数提供一个默认值当用户没有传递这个参数或传递的值是 undefined 时。 它们叫做有默认初始化值的参数。
2. 与普通可选参数不同的是，**带默认值的参数不需要放在必须参数的后面**。但是，如果带默认值的参数出现在必须参数前面，参数的个数就必须不能多也不能少
```typescript
function buildName(firstName = 'Will', lastName: string): string {
  return firstName + ' ' + lastName
}

let result1 = buildName('Bob')                  // Error, 参数过少
let result2 = buildName('Bob', 'Adams', "Sr.")  // Error, 参数过多
let result3 = buildName('Bob', 'Adams')         // OK， 返回 "Bob Adams"
let result4 = buildName(undefined, 'Adams')     // OK，  返回 "Will Adams"
```
3.**我们不能在通一个函数参数中声明一个参数又是默认参数又是可选参数**，就是不能出现这样的写法
```typescript
// error
function buildName(firstName: string, lastName? = 'Smith'): string {
  return firstName + ' ' + lastName
}
```
4.**可选参数和默认参数都表示这个参数你可传可不传，但是可选参数表示你不传就没有，默认参数表示你传不传我都有**

## 剩余参数
1. 必要参数，默认参数和可选参数有个共同点：它们表示某一个参数。 有时，你想同时操作多个参数，或者你并不知道会有多少参数传递进来。在 JavaScript 里，你可以使用 arguments 来访问所有传入的参数。在 TypeScript 里，你可以把所有参数收集到一个变量里：
```typescript
function buildName(firstName: string, ...restOfName: string[]): string {
  return firstName + ' ' + restOfName.join(' ')
}
let employeeName = buildName('Joseph', 'Samuel', 'Lucas', 'MacKinzie')
```
2. 剩余参数会被当做个数不限的可选参数。 可以一个都没有，同样也可以有任意个。 编译器创建参数数组，名字是你在省略号（ ...）后面给定的名字，你可以在函数体内使用这个数组。这个省略号也会在带有剩余参数的函数类型定义上使用到：
```typescript
function buildName(firstName: string, ...restOfName: string[]): string {
  return firstName + ' ' + restOfName.join(' ')
}
let buildNameFun: (fname: string, ...rest: string[]) => string = buildName
```
3. 剩余参数在js当中实现也很简单，可以编译上述代码你就能看见，restOfName被声明在函数内部，且将arguments从第二到最后一个位置之间的值循环赋值给restOfName

## this 和箭头函数
1. JavaScript里，this 的值在函数被调用的时候才会指定。 这是个既强大又灵活的特点，但是你需要花点时间弄清楚函数调用的上下文是什么。但众所周知，这不是一件很简单的事，尤其是在返回一个函数或将函数当做参数传递的时候。
```typescript
let deck = {
  suits: ['hearts', 'spades', 'clubs', 'diamonds'],
  cards: Array(52),
  createCardPicker: function() {
    return function() {
      let pickedCard = Math.floor(Math.random() * 52)
      let pickedSuit = Math.floor(pickedCard / 13)

      return {suit: this.suits[pickedSuit], card: pickedCard % 13}
    }
  }
}

let cardPicker = deck.createCardPicker()
let pickedCard = cardPicker()          // 报错
console.log('card: ' + pickedCard.card + ' of ' + pickedCard.suit)
```
2. 可以看到 createCardPicker 是个函数，并且它又返回了一个函数。如果我们尝试运行这个程序，会发现它并没有输出而是报错了。 因为 createCardPicker 返回的函数里的 this 被设置成了 global 而不是 deck 对象。 因为我们只是独立的调用了 cardPicker()。顶级的非方法式调用会将 this 视为 global。
3. 为了解决这个问题，我们可以在函数被返回时就绑好正确的this。 这样的话，无论之后怎么使用它，都会引用绑定的deck 对象。我们需要改变函数表达式来使用 ECMAScript 6 箭头语法。 
4. **箭头函数能保存函数创建时的 this 值**，而不是调用时的值：
```typescript
let deck = {
  suits: ['hearts', 'spades', 'clubs', 'diamonds'],
  cards: Array(52),
  createCardPicker: function() {
    // 注意：这里使用箭头函数
    return () => {
      let pickedCard = Math.floor(Math.random() * 52)
      let pickedSuit = Math.floor(pickedCard / 13)

      return {suit: this.suits[pickedSuit], card: pickedCard % 13}
    }
  }
}
let cardPicker = deck.createCardPicker()
let pickedCard = cardPicker()
console.log('card: ' + pickedCard.card + ' of ' + pickedCard.suit)
```
5. 我们将使用箭头函数的代码进行编译，编译成js代码后可以很清楚的看到，为了达到箭头函数this绑定到外层环境的对象上，它主动将this赋值给了函数中一个新的变量_this,如下：
```javascript
createCardPicker: function () {
  var _this = this;
  return function () {
      var pickedCard = Math.floor(Math.random() * 52);
      var pickedSuit = Math.floor(pickedCard / 13);
      return { suit: _this.suits[pickedSuit], card: pickedCard % 13 };
  };
}
```
6. 还有一个问题，就是实际上我们在使用TS写this的时候，我们希望编辑器给我们提示this有哪些属性，因为js当中这个没有问题，但是Ts在上述代码中它不知道this是什么类型的，所以我们需要明确告诉TS，这个this的类型，然后编辑器才会提示我们这个类型有哪些方法和属性
```typescript
interface Card {
  suit: string
  card: number
}
interface Deck {
  suits: string[]
  cards: number[]

  createCardPicker (this: Deck): () => Card
}
let deck: Deck = {
  suits: ['hearts', 'spades', 'clubs', 'diamonds'],
  cards: Array(52),
  // NOTE: 函数现在显式指定其被调用方必须是 deck 类型
  createCardPicker: function (this: Deck) {
    return () => {
      let pickedCard = Math.floor(Math.random() * 52)
      let pickedSuit = Math.floor(pickedCard / 13)
      // 这里使用this的时候，编辑器就能提示我们this有suits、cards和createCardPicker方法，因为我们告诉了this的类型为Deck
      return {suit: this.suits[pickedSuit], card: pickedCard % 13}
    }
  }
}

let cardPicker = deck.createCardPicker()
let pickedCard = cardPicker()
console.log('card: ' + pickedCard.card + ' of ' + pickedCard.suit)
```
7. 现在 TypeScrip t知道 createCardPicker 期望在某个 Deck 对象上调用。也就是说 this 是 Deck 类型的，而非 any。

## this在回调参数中
1. 你可以也看到过在回调函数里的 this 报错，当你将一个函数传递到某个库函数里稍后会被调用时。 因为当回调被调用的时候，它们会被当成一个普通函数调用，this 将为 undefined。 稍做改动，你就可以通过 this 参数来避免错误。 首先，库函数的作者要指定 this 的类型：
```typescript
interface UIElement {
  addClickListener (onclick: (this: void, e: Event) => void): void
}
class Handler {
  type: string
  onClickBad (this: Handler, e: Event) {
    this.type = e.type
  }
}
let h = new Handler()
let uiElement: UIElement = {
  addClickListener () {
  }
}
uiElement.addClickListener(h.onClickBad) // error!
```
要明确出错的原因是因为UIElement中addClickListener规定的函数的参数类型中this是void类型的，但是Handler的onClickBad中写这this为Handler类型的，所以TS会提示类型不匹配
2. 如果你两者都想要，你不得不使用箭头函数了：这是可行的因为箭头函数不会捕获 this，所以你总是可以把它们传给期望 this: void 的函数
```typescript
class Handler {
  type: string
  onClickGood = (e: Event) => {
    this.type = e.type 
  }
}
```

## 重载
1. JavaScript 本身是个动态语言。JavaScript 里函数根据传入不同的参数而返回不同类型的数据的场景是很常见的
2. TS我们希望在传入数据和返回数据做类型检测，所以我们需要做函数重载的声明
```typescript
function pickCard(x: {suit: string; card: number }[]): number       // 函数的重载声明只有参数和返回值的类型定义，没有方法体
function pickCard(x: number): {suit: string; card: number }

function pickCard(x): any {
  if (Array.isArray(x)) {
    let pickedCard = Math.floor(Math.random() * x.length)
    return pickedCard
  } else if (typeof x === 'number') {
    let pickedSuit = Math.floor(x / 13)
    return { suit: suits[pickedSuit], card: x % 13 }
  }
}
```
3. 为了让编译器能够选择正确的检查类型，它与 JavaScript 里的处理流程相似。它查找重载列表，尝试使用第一个重载定义。 如果匹配的话就使用这个。因此，在定义重载的时候，一定要把最精确的定义放在最前面。