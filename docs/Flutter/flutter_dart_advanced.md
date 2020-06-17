# Dart面向对象
`Dart`语言是一种强类型，静态编程语言，有两个比较重要的特性：
+ <font color=#9400D3>JIT</font>:（just in time）即时编译，`Flutter`在开发期间，使用的是JIT,更快的编译，更快的重载，但是在运行时需要将代码编译成为机器码，直接的感受就是慢。
+ <font color=#9400D3>AOT</font>:（ahead of time）事前编译，可以直接编译机器码（二进制代码），事先将代码编译成为二进制码，APP在`release`（发布）之后，编译方式就是`AOT`

## 常用数据类型

### 1. 数字
```dart
// 数字类型
void _numType() {
	num num1 = -1.0; // num是数字类型的父类，既可以接受浮点类型，也可以接收整型
	num num2 = 2;
	int int1 = 3; // int是数字类型的子类，只接受整型
	double d1 = 1.68; // double是数字类型的子类，只接受双精度
	print("num: $num1 num2: $num2 int: $int1 double:$d1");

	print(num1.abs()); // 求绝对值
	print(num1.toInt()); // num类型转int类型
	print(num1.toDouble()); // num类型转换成double类型
}
```

### 2. 字符串
```dart
// 字符串类型
void _stringType() {
	String str1 = '字符串', str2="双引号"; // 字符串定义可以使用单双引号
	String str3 = str1 + str2;  // 字符串 用+号进行拼接
	String str4 = "$str1 $str2"; // 字符串 用$进行拼接，有点类型javascritp中的`${}`
	print(str3);
	print(str4);
	String str5 = "常用数据类型，输出查看控制台";

	// 常用方法
	print(str5.substring(2,5)); // 字符串截取方法
	print(str5.indexOf("类型"));// 子字符的起始位置
	print(str5.startsWith("常用")); // 检查字符串是否以指定字符串开头
	print(str5.replaceAll("控制台", "打印台")); // 字符串替换指定子字符串
	print(str5.contains("输出")); // 检查字符串是否包含指定子字符串
	print(str5.split(",")); // 字符串分割
}
```

### 3. 布尔值
```dart
// 布尔类型
void _boolType() {
	// 布尔类型在Dart当中是强类型检查，只有bool类型为true，才会被认为是true
	// 而javascript中存在默认类型转换，非0数字，非空字符串都可以被认为是true
	bool success  = true;
	bool fail = false;
	print(success); // true
	print(fail); // false
}
```

### 4. 集合
<font color=#1E90FF>**① List集合**</font>

```dart
void _listType() {
	// 集合初始化的方式，泛型可以接收任何数据类型
	List list = [1, 2, 3, '字符串'];  // 1. 初始化时添加元素,此时为List<dynamic>类型
	List list1 = [];
	list1.add('list');                // 2. 使用add方法添加元素
	list1.addAll(list);               // 3. 使用addAll方法添加迭代器类型
	List list3 = List.generate(3, (index) => index*2); // 4. 集合生成器List.generate(长度，回调函数)
	print(list3); // 0 2 4

	// 集合泛型的用法
	List<int> list2 = [1 ,2, 3, 4]; // 此时为List<int>类型
	print(list2);

	// List集合的遍历(方法一) - for循环
	for(int i = 0; i< list.length; i++) {
		print(list[i]);
	}
	// List集合的遍历(方法二) - for-in
	for(var o in list) {
		print(o);
	}
	// List集合的遍历(方法三) - forEach
	list.forEach((element) {
		print(element);
	});
}
```

<font color=#1E90FF>**② Map集合**</font>

```dart
  void _mapType() {
    // map是将key和value相关联的对象，key和value都可以是任何类型的对象，key是唯一的
    // Map的初始化(方法一)
    Map names = {
      'xiaoming': '小明',
      'xiaohong': '小红'
    };
    // Map的初始化(方法二)
    Map ages ={};
    ages['xiaogming'] = 18;
    ages['xiaohong'] = 16;

    // Map的遍历方法(方法一)
    ages.forEach((key, value) {
      print('$key, $value');
    });
    // Map的遍历方法(方法二)
    Map ages2 = ages.map((key, value){
      return MapEntry(value,key);
    });
    // Map的遍历方法(方法三)
    for(var key in ages.keys) {
      print('$key ${ages[key]}');  // $xxx和${xxx}，前者xxx是变量，后者xxx是方法
    }
  }
```
### 5. dynamic,var和Object
```dart
dynamic x = 'taopoppy'; // 编译时类型未知
print(x.runtimeType); // 运行时类型为String
x = 123 // 正确：变量类型可以改变
```
<font color=#DD1144>使用dynamic可以让Dart的语法检查失效，因为Dart是静态语法检查，所以不推荐经常使用和直接使用，很容易造成运行时的报错</font>

```dart
var a = 'taopoppy'; // 编译时类型被自动推断为String
print(a.runtimeType);// 运行时类型为String
x = 123 // 错误：变量类型不可以改变
```
<font color=#DD1144>var关键字声明变量的时候表示不关心数据类型，交给系统自动推断</font>

```dart
Object b = 'taopoppy';// 编译时类型被自动推断为Object
print(a.runtimeType);// 运行时类型为String
b.split(); // 错误：无法使用Object之外的方法
```
<font color=#DD1144>Object是Dart语言中所有对象的基类，但是如果你用它来声明变量，只能调用Object基类中的方法，哪怕它就是String类型的，也不能使用String类型的方法</font>

## 面向对象_构造方法
<img :src="$withBase('/flutter_opp.png')" alt="面向对象">

### 1. 初始化列表

<font color=#1E90FF>**① 标准的构造方法**</font>

```dart
// 定义一个Dart类，所有的类都继承自Object
class Person {
  String name;
  int age;
  // 标准的构造方法（最普通的构造方法）
  Person(this.name, this.age);
  // 重写父类方法
  @override
  String toString() {
    // return super.toString();
    return 'name:$name, age:$age';
  }
}
```
<font color=#1E90FF>**② 构造方法中的可选参数和默认参数**</font>

```dart
class Student extends Person {
  String _school; // 私有变量通过下划线来标识
  String city;
  String country;
  String name;

	// 可选参数和默认参数都要写在{}当中
	// 默认参数首先要属于可选参数
	// this.city属于可选参数，this.country首先属于可选参数，其次属于默认参数
  Student(this._school ,String name, int age,{this.city,this.country='China'}) : super(name, age);
}
```
然后创建实例的时候可以这样书些：
```dart
  void _oopLearn() {
    // 三个必须传递的参数
    Student stu1 = Student('清华', 'Jack', 18);

    // 三个必须传递的参数和两个可选参数
    Student stu2 = Student('北大', 'Tom', 16,city: '上海',country: '中国');
    print(stu2.toString());
  }
```

<font color=#1E90FF>**③ 初始化列表**</font>

<font color=#DD1144>初始化列表除了调用父类的构造器，在子类构造器方法体之前，也可以初始化实例变量，不同的初始化变量之间用逗号分开，同时构造方法的方法体可以写也可以不写</font>

```dart
class Student extends Person {
  String _school; String city;String country;String name;

	// 无构造方法方法体的构造方法
  Student(this._school ,String name, int age,{this.city,this.country='China'}): name = '$country.$city', super(name, age);
}
```
```dart
class Student extends Person {
  String _school; String city;String country;String name;

	// 有构造方法方法体的构造方法
  Student(this._school ,String name, int age,{this.city,this.country='China'}): name = '$country.$city', super(name, age){
		print('这里是构造方法体，但是不是必须的')
	};
}
```
### 2. 命名构造方法
```dart
class Student extends Person {
  String _school; String city; String country; String name;
  Student(this._school ,String name, int age,{this.city,this.country='China'}): name = '$country.$city', super(name, age) {
    print('这里是Student类的构造方法体');
  }

  // 命名构造方法： [类名+.+方法名]
  // 使用命名构造方法为类实现多个构造方法
  Student.cover(Student stu): super(stu.name,stu.age) {
    print('命名构造方法');
  }
}
```

### 3. 工厂构造方法
```dart
class Logger {
  static Logger _cache; // 私有的静态变量

  // 工厂构造方法
  // 不仅仅是构造方法，更是一种模式
  // 有时候为了返回一个之前已经创建的缓存对象，原始的构造方法已经不能满足需求
  // 那么可以使用工厂模式来定义构造方法
  factory Logger() {
    if(_cache == null) {
      _cache = Logger._internal();
    }
    return _cache;
  }
  Logger._internal(); // 这个一个命名构造方法
  void log(String msg) {
    print(msg);
  }
}
```
可以看到，整个`Logger`类只向外暴露了一个工厂方法，所以通过工厂构造方法返回的都是同一个静态`_cache`,或者说是同一个实例。
```dart
  void _oopLearn() {
    Logger log1 = Logger();
    Logger log2 = Logger();
    print(log1 == log2); // true
  }
```

### 4. 命名工厂构造方法
<font color=#1E90FF>命名工厂构造方法是我们在做数据解析的时候，也就是将网络请求的数据转换成模型的时候，经常用到的一种构造方法</font>

```dart
class Student extends Person {
  final String city; // final定义的常量

	// 命名构造方法必须将final声明的常量作为参数传入
  Student.cover(Student stu,this.city): super(stu.name,stu.age) {
    print('命名构造方法');
  }


  // 命名工厂构造方法： factory [类名+.+方法名]
  // 它可以有返回值，而且不需要将类的final变量作为参数，是提供一种灵活获取类对象的方式
  factory Student.stu(Student stu) {
    return Student(stu._school, stu.name, stu.age);
  }
}
```

## 面向对象_实例方法

### 1. set和get
```dart
class Student extends Person {
  // 定义类的变量
  String _school; // 通过下划线来标识私有字段（变量）

  // 可以为私有字段设置getter来让外界获取到私有字段
  String get school => _school;

  // 可以为私有字段设置settter来控制外界对私有字段的修改
  set school(String value) {
    _school = value;
  }
}
```
有了这样的写法，我们可以直接在外部来获取和修改私有变量
```dart
  void _oopLearn() {
    Student stu1 = Student('清华', 'Jack', 18);
    stu1.school = '985';
    print(stu1.school); // 985
  }
```

### 2. 静态方法
```dart
class Student extends Person {
  // 静态方法
  // 静态方法的调用是通过 类名+静态方法名 的方式
  static doPrint(String str) {
    print('doPrint:$str');
  }
}

Student.doPrint("taopoppy"); // doPrint:taopoppy
```

### 3. 抽象方法
```dart
// 使用 abstract 修饰符来定义一个抽象类，该类不能被实例化
// 抽象类在定义接口的时候非常有用
abstract class Study {
  void study(); // 无方法体的方法
  @override
  String toString() {
    // 有方法体的方法
    return super.toString();
  }
}

class StudyFlutter extends Study {
  @override
  void study() {
    // 继承抽象类的子类要实现抽象类中的方法
    print('Learning Flutter');
  }
}
```
```dart
void _oopLearn() {
  StudyFlutter studyFlutter = StudyFlutter();
  studyFlutter.study(); // Learning Flutter
}
```

注意：<font color=#1E90FF>一个类如果前面有abstract就是抽象类，抽象类当中可以不包含抽象方法，但是有抽象方法的类必须属于抽象类</font>

### 4. mixins方法
通过`mixins`可以为类添加一下特性
+ <font color=#1E90FF>mixins是在多个类层次结构中重用代码的一种方式</font>
+ <font color=#1E90FF>使用mixins，在with关键字后面跟上一个或者多个mixin的名字（逗号分开）</font>
+ <font color=#1E90FF>with要位于extends关键字之后</font>
+ <font color=#1E90FF>实现mixin，就要创建一个继承Object类的子类（不能继承别的类），不能声明任何构造方法，不能调用super</font>

```dart
// Study类满足所有mixins的特征，所以Study类是一个mixin
abstract class Study {
  void study();
  @override
  String toString() {
    print('study');
  }
}

class Test extends Person with Study {
  Test(String name, int age) : super(name, age);

  @override
  void study() {
    // 复用了Study这个mixin当中的特性，就是它有一个study方法
    // 同时也继承了Study当中的toString方法
  }
}
```
<font color=#DD1144>我们通常在开发当中使用mixins来为我们现有的类来复用已经存在的类的特性</font>

### 5. 泛型类

<font color=#1E90FF>**① 通用类型**</font>

```dart
// 泛型
// 主要解决类，接口，方法的的复用性，以及对不特定数据类型的支持

// 泛型类
// 作用：提高代码的复用度
class Cache<T> {
  static final Map<String,Object> _cache = Map();
  // 泛型方法
  void setItem(String key, T value){
    _cache[key] = value;
  }

  T getItem(String key) {
    return _cache[key];
  }

  void forEachCache() {
    _cache.forEach((key, value) {
      print('$key-$value');
    });
  }
}

class TestGeneric {
  void start() {
    Cache<String> cache1 = Cache();
    cache1.setItem('cache1', 'taopoppy');
    cache1.setItem('cache2', 'bijingjing');
    cache1.forEachCache(); // cache1-taopoppy cache2-bijingjing

    Cache<int> cache2 = Cache();
    cache2.setItem('num1', 1);
    cache2.setItem('num2', 2);
    cache2.forEachCache(); // num1-1 num2-2

  }
}
```

<font color=#1E90FF>**② 类型约束**</font>

```dart
// 有时候你在实现类似通用接口的泛型中，期望的类型是某些特定类型时，这时可以使用类型约束
class Member<T extends Person> {
  T _person;

  Member(this._person);

  String fixedName() {
    return 'fixed:${_person.name}';
  }
}

class TestGeneric {
  void start() {
    Member<Student> member = Member(Student(' ',' ', 16));
    print(member.fixedName());
  }
}
```

## 面向对象_编程技巧
+ <font color=#DD1144>封装，大到功能模块的封装，类的封装与抽象，小到方法的封装，封装的目的在于复用，易于扩展和维护</font>

+ <font color=#DD1144>不要在一个方法题里面堆砌太多的代码（小于100）</font>

+ <font color=#DD1144>在一个类的世界里，万物皆对象，查看对象的属性和方法，看类的源码，看方法的实现</font>

<font color=#1E90FF>**① 安全调用**</font>

<font color=#DD1144>对于不确定是否为空的对象可以通过?.的方式来访问它的属性和方法</font>

```dart
void main() {
  List list;
  print(list?.length) // null
}
```

<font color=#1E90FF>**② 默认值**</font>

<font color=#DD1144>可以通过??这种双问号的写法来设置默认值</font>

```dart
void main() {
  List list;
  print(list?.length??0); // 0
}
```

<font color=#1E90FF>**③ 简化判断**</font>

```dart
void main() {
  List list;
  list.add(0);

  // 复杂的判断方式s == '' || list[0] == 0) {
    print('list[0] is empty');
  }

  // 简化判断
  if([null,'',0].contains(List[0])) {
    print('list[0] is empty');
  }
}
```
