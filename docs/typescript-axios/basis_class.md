# 类
对于传统的 JavaScript 程序我们会使用函数和基于原型的继承来创建可重用的组件，但对于熟悉使用面向对象方式的程序员使用这些语法就有些棘手，因为他们用的是基于类的继承并且对象是由类构建出来的。 从 ECMAScript 2015，也就是 ES6 开始， JavaScript 程序员将能够使用基于类的面向对象的方式。 使用 TypeScript，我们允许开发者现在就使用这些特性，并且编译后的 JavaScript 可以在所有主流浏览器和平台上运行，而不需要等到下个 JavaScript 版本。

## 基本实例
1. 下面是基本的实例
```typescript
class Greeter {
  greeting: string
  constructor(message: string) {
    this.greeting = message
  }
  greet() {
    return 'Hello, ' + this.greeting
  }
}
let greeter = new Greeter('world')
```
2. 如果你使用过 C# 或 Java，你会对这种语法非常熟悉。 我们声明一个 Greeter 类。这个类有 3 个成员：一个叫做 greeting 的属性，一个构造函数和一个 greet 方法。你会注意到，我们在引用任何一个类成员的时候都用了 this。 它表示我们访问的是类的成员。最后一行，我们使用 new 构造了 Greeter 类的一个实例。它会调用之前定义的构造函数，创建一个 Greeter 类型的新对象，并执行构造函数初始化它。
  
## 继承
1. 在 TypeScript 里，我们可以使用常用的面向对象模式。 基于类的程序设计中一种最基本的模式是允许使用继承来扩展现有的类
```typescript
class Animal {
  name:string
  constructor(name:string) {
    this.name = name
  }
  move(distance:number = 0) {
    console.log(`${this.name} move ${distance} m`)
  }
}
class Snake extends Animal {
  constructor(name:string) {
    super(name)               // 这里使用super去继承父类的构造函数
  }
  move(distance:number = 5) { // 这里是对move方法的重写，子类的move和父类的move可能会不一样
    console.log('Slithering...')
    super.move(distance)      // 使用super.move调用父类的move方法，可见子类的move比父类的move多了一个console.log语句
  }
  pop(num:number = 190) {
    console.log(num)
  }
}
let snake = new Snake('taopopy')
let snake1:Animal = new Snake('poppy')
```
2. 派生类包含了一个构造函数，它 必须调用 super()，它会执行基类的构造函数。 而且，**在构造函数里访问 this 的属性之前，我们 一定要调用 super()。 这个是TypeScript 强制执行的一条重要规则**。
3. **<code>let snake1:Animal = new Snake('poppy')</code>中虽然声明的是Animal类型，但是赋值是Snake类型，所以这里有两种情况**
+ **调用子类的独有方法pop不允许，因为是Animal类型的**
+ **调用子类的重写方法move允许，但是使用的子类重写后的move，而不是父类中的move**

## 公共，私有与受保护的修饰符
**1. 默认为 public**
+ 我们在之前的代码里并没有使用 public 来做修饰,在 TypeScript 里，成员都默认为 public

**2. 理解 private**
+ **当成员被标记成 private 时，它就不能在声明它的类的外部访问**
+ TypeScript 使用的是结构性类型系统。 当我们比较两种不同的类型时，并不在乎它们从何处而来，如果所有成员的类型都是兼容的，我们就认为它们的类型是兼容的。然而，当我们比较带有 private 或 protected 成员的类型的时候，情况就不同了。 如果其中一个类型里包含一个 private 成员，那么只有当另外一个类型中也存在这样一个private 成员，并且它们都是来自同一处声明时，我们才认为这两个类型是兼容的。 对于 protected 成员也使用这个规则。
```typescript
class Animal {
  private name: string         // 私有成员
  constructor(name: string) { 
    this.name = name 
  }
}
class Rhino extends Animal {
  constructor() { 
    super('Rhino')             // 这里要注意，父类的私有成员name这里继承了并且是有的，只不过你看不到，你也拿不到
  }
}
class Employee {
  private name: string
  constructor(name: string) { 
    this.name = name
  }
}
let animal = new Animal('Goat')
let rhino = new Rhino()
let employee = new Employee('Bob')
animal = rhino                // 正确，因为rhino中的私有成员name 是从Animal中继承来的，是同一个name，也就是animal中定义的那个name
animal = employee             // 错误: Animal 与 Employee 不兼容.因为employee中的name和animal中的name不是同一个name，虽然表面看都是name
```

**3. 理解 protected**
+ protected 修饰符与 private 修饰符的行为很相似，但有一点不同，**protected成员在派生类中仍然可以访问**。
+ **构造函数也可以被标记成 protected，这意味着不能去实例这个class，但是这个类的子类可以被实例化**，如下
```typescript
class Person {
  protected name: string             // 受保护的成员
  private sex:string                 // 私有成员
  protected constructor (name: string,sex:string) {   // Person这个类的构造函数被protected修饰，则不能new 去实例一个Person的对象
    this.name = name
    this.sex = sex 
  }
}
class Employee extends Person {          //Employee继承了Person，它是可以通过new 去实例对象的，如果它的构造函数也被protected修饰了，也不能用new去实例对象
  private department: string

  constructor(name: string, department: string,sex:string) {
    super(name,sex)
    this.department = department
  }
  
  getElevatorPitch() {
    console.log(this.name)        // 正确 name是父类中受保护的类型，在子类中可以访问
    console.log(this.sex)         // 错误 sex是父类中私有的类型，在子类中不能访问
    console.log(this.department)  // 子类中的私有类型在子类中可以访问，这不是废话么
  }
}
```
    
**4. readonly 修饰符**
+ 你可以使用 readonly 关键字将属性设置为只读的。 只读属性必须在声明时或构造函数里被初始化。
```typescript
class Person {
  readonly name: string
  constructor(name: string) {
    this.name = name
  }
}
let john = new Person('John')
john.name = 'peter'
```
**5. 参数属性**
+ 在上面的例子中，我们必须在 Person 类里定义一个只读成员 name 和一个参数为 name 的构造函数，并且立刻将 name 的值赋给 this.name，这种情况经常会遇到。 参数属性可以方便地让我们在一个地方定义并初始化一个成员。 下面的例子是对之前 Person 类的修改版，使用了参数属性：
```typescript
class Person {
  constructor(readonly name: string) {
  }
}
```
+ 注意看我们是如何舍弃参数 name，仅在构造函数里使用 readonly name: string 参数来创建和初始化 name 成员。 我们把声明和赋值合并至一处。
+ 参数属性通过给构造函数参数前面添加一个访问限定符来声明。使用 private 限定一个参数属性会声明并初始化一个私有成员；对于 public 和 protected 来说也是一样
+ **推荐不要去使用参数属性的写法，因为不直观**

## 存取器
1. TypeScript 支持通过 getters/setters 来截取对对象成员的访问。 它能帮助你有效的控制对对象成员的访问。
```typescript
let passcode = 'secret passcode'
class Employee {
  private _fullname:string    // 通常使用下划线来标识一个变量为私有变量
  constructor(fullname:string) {
    this._fullname = fullname
  }
  get fullName():string {
    return this._fullname
  }
  set fullName(newName:string) {
    if(passcode && passcode === 'secret passcode') {
      this._fullname = newName
    } else {
      console.log('Error: you should sign in')
    }
  }

  getFullName() {
    console.log(this.fullName === this._fullname) 
  }
}

let employee = new Employee('jhaha')
if(employee.fullName) {
  console.log(employee.fullName) //jhaha
}
employee.fullName = 'bb'
if(employee.fullName) {
  console.log(employee.fullName) //bb
}
employee.getFullName() // true
```
2. 首先，存取器要求你将编译器设置为输出 ECMAScript 5 或更高。 不支持降级到 ECMAScript 3。其次，只带有 get 不带有 set 的存取器自动被推断为 readonly。这在从代码生成 .d.ts 文件时是有帮助的，因为利用这个属性的用户会看到不允许够改变它的值。
3. 所以我们编译的时候需要使用这样的命令: tsc xxx.ts --target es5
4. 关于存取器我们需要很清楚的知道编译后的js代码是什么样子的:
```javascript
var Employee = /** @class */ (function () {
    function Employee(fullname) {
        this._fullname = fullname;              // 普通的变量都会在函数当中直接申明
    }
    Object.defineProperty(Employee.prototype, "fullName", { // 使用了存取器后，这个变量是往函数的原型上面挂载的，使用的方法是Object.defineProperty
        get: function () {
            return this._fullname;
        },
        set: function (newName) {
            if (passcode && passcode === 'secret passcode') {
                this._fullname = newName;
            }
            else {
                console.log('Error: you should sign in');
            }
        },
        enumerable: true,
        configurable: true
    });
    Employee.prototype.getFullName = function () {
        console.log(this.fullName === this._fullname);
    };
    return Employee;
}());
```

## 静态属性(这个比较重要)
1. 到目前为止，我们只讨论了类的实例成员，那些仅当类被实例化的时候才会被初始化的属性。 我们也可以创建类的静态成员，这些属性存在于类本身上面而不是类的实例上。在这个例子里，我们使用 static 定义 origin，因为它是所有网格都会用到的属性。 每个实例想要访问这个属性的时候，都要在 origin 前面加上类名。 如同在实例属性上使用 this.xxx 来访问属性一样，这里我们使用 Grid.xxx 来访问静态属性。
```typescript
class Grid {
  static origin = {x: 0, y: 0}    // static声明静态属性
  scale: number
  constructor (scale: number) {
    this.scale = scale
  }
  calculateDistanceFromOrigin(point: {x: number; y: number}) {
    let xDist = point.x - Grid.origin.x                            // 通过Grid.origin去拿到在Grid类中声明的origin静态属性
    let yDist = point.y - Grid.origin.y
    return Math.sqrt(xDist * xDist + yDist * yDist) * this.scale
  }
}

let grid1 = new Grid(1.0)  // 1x scale
let grid2 = new Grid(5.0)  // 5x scale
console.log(grid1.calculateDistanceFromOrigin({x: 3, y: 4}))
console.log(grid2.calculateDistanceFromOrigin({x: 3, y: 4}))
```  

## 抽象类
1. 抽象类做为其它派生类的基类使用。 它们一般不会直接被实例化。不同于接口，抽象类可以包含成员的实现细节。 
2. **abstract 关键字是用于定义抽象类和在抽象类内部定义抽象方法**。
```typescript
abstract class Animal {            // 使用abstract 关键字标识这个是抽象类  
  public abstract makeSound(): void       // 抽象方法，定义方法的签名，不包含方法体
  move(): void {
    console.log('roaming the earth...')
  }
}
```
3. 抽象类中的抽象方法不包含具体实现并且必须在派生类中实现。 抽象方法的语法与接口方法相似。两者都是定义方法签名但不包含方法体。然而，抽象方法必须包含 abstract 关键字并且可以包含访问修饰符。
```typescript
abstract class Department {
  name: string
  constructor(name: string) {
    this.name = name
  }
  printName(): void {
    console.log('Department name: ' + this.name)
  }
  abstract printMeeting(): void // 必须在派生类中实现
}

class AccountingDepartment extends Department {
  constructor() {
    super('Accounting and Auditing') // 在派生类的构造函数中必须调用 super()
  }

  printMeeting(): void {
    console.log('The Accounting Department meets each Monday at 10am.')
  }

  generateReports(): void {
    console.log('Generating accounting reports...')
  }
}

let department: Department               // 允许创建一个对抽象类型的引用
department = new Department()            // 错误: 不能创建一个抽象类的实例
department = new AccountingDepartment()  // 允许对一个抽象子类进行实例化和赋值
department.printName()
department.printMeeting()
department.generateReports()             // 错误: 方法在声明的抽象类中不存在
```
4. **特别要注意，上述例子中虽然用子类去实例化，但实例声明的是抽象类的类型，所以子类独有的generateReports方法无法使用**

## 高级技巧
**1.修改静态属性**
+ 实例
```typescript
class Greeter {
  static standardGreeting = 'Hello, there'
  greeting: string
  constructor(message?: string) {
    this.greeting = message
  }
  greet() {
    if (this.greeting) {
      return 'Hello, ' + this.greeting
    } else {
      return Greeter.standardGreeting
    }
  }
}

let greeter: Greeter
greeter = new Greeter()
console.log(greeter.greet())          

let greeterMaker: typeof Greeter = Greeter             //  这里取的Greeter类的静态类型的类，不是实例类型的类，
greeterMaker.standardGreeting = 'Hey there'            //  通过这个静态类型的类可以拿到类中的静态属性并去修改
let greeter2: Greeter = new greeterMaker()             //  重新new 一个修改静态属性后的类
console.log(greeter2.greet())   // Hey there
let gretter3 = new Greeter() 
console.log(greeter2.greet())   // Hey there   
```
+ 我们创建了一个叫做 greeterMaker 的变量。这个变量保存了这个类或者说保存了类构造函数。 然后我们使用 typeof Greeter，意思是取 Greeter 类的类型，而不是实例的类型。或者更确切的说，"告诉我 Greeter 标识符的类型"，也就是构造函数的类型。 这个greeterMaker类型包含了Greeter类的所有静态成员和构造函数。之后，就和前面一样，我们在greeterMaker上使用new，创建Greeter的实例。