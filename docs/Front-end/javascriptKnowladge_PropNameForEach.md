# JS对象属性遍历
对象上有很多属性，属性也有不同的分类，我们有很多可以返回属性名的方法，我们所有遍历的方法都以下面这个例子为基础，展示不同方法返回的结果
```javascript
    let name = Symbol('这个是乳名')
    let nose = Symbol('每个人都有鼻子')
    let obj = {
      name: 'taopoppy',
      sex: 'man',
      age: 12
    }
    obj[name] = 'chuanchan'                // 对象自身添加Symbol属性
    Object.defineProperty(obj, 'father', {
      enumerable: false,
      value: 'Father'                      // 对象自身添加不可枚举的属性
    })
    Object.defineProperty(obj, 'mother', {
      enumerable: true,
      value: 'Mother'                      // 对象自身添加可枚举的属性
    })

    Object.prototype.pro1 = function() {}; // 原型链上添加可枚举属性
    Object.prototype.color = 'yellow'      // 原型链上添加可枚举属性
    Object.prototype[nose] = 'yes'         // 原型链上添加Symbol属性
    Object.defineProperty(Object.prototype, 'arms', {
      enumerable: true,
      value: 'two'                         //原型链上添加可枚举属性
    })
    Object.defineProperty(Object.prototype, 'header', {
      enumerable: false,
      value: 'black'                       //原型链上添加不可枚举属性
    })
```

## 属性名的遍历

### 1. Reflect.ownKeys()
<font color=#3eaf7c>返回对象自身的所有属性,不管属性名是Symbol或字符串,也不管是否可枚举.不包含原型上的任何属性</font>
```javascript
Reflect.ownKeys(obj).forEach(propName => {
  console.log(propName)
})
```
输出结果：
```javascript
name                // 对象自身可枚举的属性
sex                 // 对象自身可枚举的属性
age                 // 对象自身可枚举的属性
father              // 对象自身不可枚举的属性
mother              // 对象自身不可枚举的属性
Symbol(这个是乳名)   // 对象自身的Symbol属性
```

### 2. for...in
<font color=#3eaf7c>遍历先输出的是对象自身的可枚举的属性(不包含Symbol)，然后是原型链上可枚举的属性(不包含Symbol)</font>、

```javascript
for(let propName in obj) {
  console.log(propName,obj[propName])
}
```
输出结果: 
```javascript
name taopoppy   // 对象自身可枚举的属性
sex man         // 对象自身可枚举的属性
age 12          // 对象自身可枚举的属性
mother Mother   // 对象自身可枚举的属性
pro1 ƒ () {}    // 原型上可枚举的属性
color yellow    // 原型上可枚举的属性
arms two        // 原型上可枚举的属性
```

### 3. Object.keys()
<font color=#3eaf7c>遍历对象返回的是一个包含对象自身可枚举属性的数组(不含Symbol属性).不包含原型上的任何属性</font>这里能够看出Object.keys()返回的结果是for..in返回结果的子集
```javascript
Object.keys(obj).forEach(propName=> {
  console.log(propName)
})
```
输出结果：
```javascript
name    // 对象自身可枚举的属性
sex     // 对象自身可枚举的属性
age     // 对象自身可枚举的属性
mother  // 对象自身可枚举的属性
```

### 4. Objcet.getOwnPropertyNames()
<font color=#3eaf7c>输出对象自身的可枚举和不可枚举属性的数组,不输出原型链上的属性</font>
```javascript
Object.getOwnPropertyNames(obj).forEach(propName => {
  console.log(propName)
})
```
输出结果：
```javascript
name taopoppy   // 对象自身可枚举的属性
sex man         // 对象自身可枚举的属性
age 12          // 对象自身可枚举的属性
mother Mother   // 对象自身可枚举的属性
father Father   // 对象自身不可枚举的属性
```

### 5. Object.getOwnPropertySymbols()
<font color=#3eaf7c>输出对象自身的所有Symbol属性,不输出原型链上的Symbol属性</font>
```javascript
Object.getOwnPropertySymbols(obj).forEach(propName => {
  console.log(propName)
})
```
输出结果：
```javascript
Symbol(这个是乳名)
```

## 属性值的遍历
方法`Object.values()`和`Object.entries()`是两个属性值遍历的方法，两个方法和属性名遍历中的`Object.keys()`关系紧密

### 1. Object.values()
<font color=#3eaf7c>遍历对象返回的是一个包含对象自身可枚举属性的`value`的数组(不含Symbol属性).不包含原型上的任何属性</font>
```javascript
Object.values(obj).forEach(propValue => {
  console.log(propValue)
});
```
输出结果：
```javascript
taopoppy    // 对象自身可枚举的属性name的值
man         // 对象自身可枚举的属性sex的值
12          // 对象自身可枚举的属性age的值
Mother      // 对象自身可枚举的属性mother的值
```

### 2. Object.entries()
<font color=#3eaf7c>返回该对象自身可枚举属性(不含Symbol属性)的键值对数组</font>
```javascript
Object.entries(obj).forEach(element => {
  console.log(element)
})
```
输出结果：
```javascript
["name", "taopoppy"]  // 对象自身可枚举的属性名name和其值taopoppy
["sex", "man"]        // 对象自身可枚举的属性名sex和其值man
["age", 12]           // 对象自身可枚举的属性名age和其值12
["mother", "Mother"]  // 对象自身可枚举的属性名mother和其值Mother
```

## 总结
<mermaid>
graph LR
  A["属性遍历"] --> B["属性值遍历"]
  A["属性遍历"] --> C["属性名遍历"]
  B --> I["Object.values()"]
  B --> J["Object.entries()"]
  C --> D["1.&nbsp;Object.keys()"]
  C --> E["2.&nbsp;Objcet.getOwnPropertyNames()"]
  C --> F["3.&nbsp;Object.getOwnPropertySymbols()"]
  C --> G["4.&nbsp;Reflect.ownKeys()"]
  C --> H["5.&nbsp;for...in"]
  I --> |关联|D
  J --> |关联|D
  D --> K["自身可枚举"]
  E --> L["自身可枚举，自身不可枚举"]
  F --> M["自身Symbol"]
  G --> N["自身可枚举，自身不可枚举，自身Symbol"]
  H --> O["自身可枚举，原型可枚举"]
</mermaid>

我们怎么去记忆这幅图?首先5个遍历方法，我们可以按照输出的方位从大到小来记忆:
记忆的顺序: `for...in` > `Reflect.ownKeys()` > `getOwnPropertySymbols()` > `getOwnPropertyNames()` > `Object.keys()`
<mermaid>
graph LR
  A["for...in"] -->B["Reflect.ownKeys()"]
  B --> C["Object.getOwnPropertySymbols()"]
  B --> D["Objcet.getOwnPropertyNames()"]
  D --> E["Object.keys()"]
</mermaid>

为什么这样排序，因为`for...in`不仅能输出对象本身上的可枚举属性，还能输出原型上的可枚举属性，所以它是老大，范围最大，过来是`Reflect.ownKeys()`,它只能输出对象本身上的属性，所以比`for...in`范围就小一下，但是它能输出对象本身所有属性，所以相对于后面三个，它就是对象本身属性输出最全的，排老二。过来是`getOwnPropertySymbols()`，最后`getOwnPropertyNames()`和 `Object.keys()`连在一起是有原因的，因为`getOwnPropertyNames()`输出可枚举和不可枚举，现在`Object.keys()`的输出是它的子集，而且按照上面的图你还能看见`getOwnPropertySymbols()`和`getOwnPropertyNames()`长的很像，上下并列也有助于加深记忆，所以按照这样的顺序你记忆保证不会忘。





**参考资料**
1. [JS常用方法整理-遍历对象](https://cloud.tencent.com/developer/article/1195953)
2. [js中遍历对象（5种）和遍历数组（6种）的方法总结](http://www.php.cn/js-tutorial-408347.html)