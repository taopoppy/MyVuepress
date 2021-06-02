# 栈

## 概述
<font color=#DD1144>栈就是一个后进先出的数据结构</font>

结构类似于一个蜂窝煤，先放进去的煤一定在最底下，后放进去的在最上面，涉及到的两个方法：
+ <font color=#1E90FF>push</font>：进栈
+ <font color=#1E90FF>pop</font>：出栈

涉及到的结构关键词：
+ <font color=#1E90FF>top</font>：栈最上层的位置

在`javascript`当中，没有栈这个变量，但是可以使用`Array`实现栈的所有功能，我们现在来实现一下：
```javascript
// 创建一个栈
const stack = []

// 入栈
stack.push(1)
stack.push(2)

// 出栈
const item1 = stack.pop()  // 2
const item2 = stack.pop()  // 1
```
可以看到实际上对于栈的操作，`javascript`当中的数组当中的`push`和`pop`是与之对应的。`push`就是向数组的尾部添加一个元素，`pop`就是移除数组的尾部元素，可见数组的尾部就是栈的`top`，如下图所示，将一个栈向右放倒就是一个数组：

<img :src="$withBase('/react_algorithm_1.png')" alt="">

## 使用场景
+ <font color=#1E90FF>需要<font color=#DD1144>后进先出</font>的场景</font>
+ 比如：十进制转二进制，判断字符串的括号是否有效，函数调用堆栈等等

<font color=#1E90FF>**① 十进制转二进制**</font>

一个十进制转二进制的算法是每次除以2，然后记录余数，比如35使用二进制表示
+ 35/2 = 17 余 1(k0)低位
+ 17/2 = 8  余 1(k1)
+ 8/2 = 4   余 0(k2)
+ 4/2 = 2   余 0(k3)
+ 2/2 = 1   余 0(k4)
+ 1/2 = 1   余 1(k5)高位

但是二进制表示的方法是从高位到低位，也就是最后求出来的余数反而要放在二进制表示的第一位，所以我们可以利用栈结构，依次将余数入栈，然后按照出栈的顺序就能得到二进制表示100011

<font color=#1E90FF>**② 有效的括号**</font>

+ 越靠后的左括号，对应的有括号越靠前。
+ 左括号入栈，右括号出栈，最后栈空了就是合法的。

<font color=#1E90FF>**③ 函数调用堆栈**</font>

函数调用堆栈是最好理解的，比如下面的这个代码
```javascript
function a() {
	b()
}
function b() {}
a()
```
执行函数对应入栈，函数执行完毕对应出栈，所以a执行的时候入栈，b执行的之后入栈，b执行完毕出栈，然后回到a里面，因为a函数还没有执行完毕，所以a还在栈当中，等a执行完毕，a出栈。所以函数的<font color=#1E90FF>先执行的最后执行完毕</font>和栈的<font color=#1E90FF>先进去的后出来</font>是不是一样的道理？

## LeetCode示例
### 1.有效括号
我们到`LeetCode`找到题号为20的有效括号这个题目，我们的解题思路如下：
+ <font color=#1E90FF>新建一个栈</font>
+ <font color=#1E90FF>扫描字符串，遇到左括号入栈，遇到和栈顶括号类型匹配的右括号就出栈，类型不匹配就直接判定为不合法</font>
+ <font color=#1E90FF>最后栈空了就合法，否则不合法</font>
```javascript
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    if(s.length % 2 !== 0 ) return false 
    // 申明一个栈
    const stack = []
    for(let i = 0; i<s.length; i++) {
        const c = s[i]
        if(c === "(" || c==="{" || c === "[") {
            stack.push(c)
        } else {
            const t = stack[stack.length - 1]
            if(
                (t === "(" && c === ")") ||
                (t === "{" && c === "}") ||
                (t === "[" && c === "]")
            ){
                stack.pop()
            } else {
                return false
            }
        }
    }
    return stack.length === 0
};
```
关于优化，实际上可以使用字典去优化，让它更快，我们后续再说。
+ <font color=#9400D3>时间复杂度分析</font>：只有一个`for`循环，里面的程序也都是`O(1)`的复杂度，所以时间复杂度就是`O(n)`
+ <font color=#9400D3>空间复杂度分析</font>：在极端的情况下，`stack`这个单元会被占满，所以空间复杂度为`O(n)`

## 前端与栈
前端当中和栈有关的典型就是函数堆栈了，这个我们前面已经简单的说明了，这里就不赘述了。