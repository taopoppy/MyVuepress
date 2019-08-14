# 匹配器和命令行

## jest中的匹配器
我们在上一节使用的`expect(xxx).toBe(yyy)`这种语法中的`toBe`就是一中匹配器，因为我们期待`xxx`去匹配`yyy`，所以我们先从`toBe`这个匹配器开始说起：

### 1. toBe
在官方文档对`toBe`有这样一段描述：`Use .toBe to compare primitive values or to check referential identity of object instances. It calls Object.is to compare values, which is even better for testing than === strict equality operator.`这句话的意思是：

<font color=#3eaf7c>
使用.toBe比较原始值或检查对象实例的引用标识。它调用Object.is来比较值，这比测试比===严格相等运算符更好</font>

### 2. toEqual
在官方文档中对`toEqual`有这样一段描述：`Use .toEqual to compare recursively all properties of object instances (also known as "deep" equality). It calls Object.is to compare primitive values, which is even better for testing than === strict equality operator.`这句话的意思就是：

<font color=#3eaf7c>
使用.toEqual以递归方式比较对象实例的所有属性（也称为“深度”相等）。它调用Object.is来比较原始值，这比测试比===严格相等运算符更好。</font>

```javascript
test('测试加法 3 + 7',() => {
  const one = {one:1}
  expect(one).toEqual({one:1})
})
```

### 3. toBeNull
在官网对`toBeNull`有一段这样的描述：`toBeNull() is the same as .toBe(null) but the error messages are a bit nicer. So use .toBeNull() when you want to check that something is nul`这句话的啥意思就是：

<font color=#3eaf7c>
toBeNull（）与.toBe（null）相同，但错误消息更好一些。因此，当您想要检查某些内容是否为n时，请使用.toBeNull（）</font>

```javascript
test('测试加法 3 + 7',() => {
  const one = null
  expect(one).toBeNull()
})
```

### 4. 真假匹配
