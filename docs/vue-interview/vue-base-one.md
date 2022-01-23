# vue3旧语法回顾

## 基础语法回顾
这里我们不会再一点一滴的书写`vue`的语法，我们直接就列举一些比较重点的点，然后新语法我们会在后面详细的说明

### 1. mvvm
`mvvm`设计模式，`m`就是`model`数据，`v`就是`view`视图，`vm`就是`viewModel`视图数据连接层, <font color=#3eaf7c>所以我们书写vue实际上data是我们要书写的数据层，template是我们要书写的视图层，而vm是vue帮助我们做的，这才是我们应该正确理解vue和mvvm的一部分</font>

### 2. 生命周期函数
+ `beforeCreate`: 是在创建`Vue`对象之前
+ `created`: 是创建好了`Vue`对象之后
+ 中间有一层将数据和`template`进行结合的过程，<font color=#1E90FF>实际就是执行了render函数</font>， 这里有一个判断，`Vue`当中有`template`属性就拿`template`作为模板，没有的话就拿正式`dom`的`root`根节点下的内容做模板。
+ `beforeMount`: 将render生成好的虚拟`dom`往真实的`dom`挂载之前
+ `Mounted`: 已经将虚拟`dom`代替了网页上真实的`dom`之后
+ `beforeUpdate`: 在`data`数据发生变化的时候会自动执行，但是页面还没有变化
+ `updated`: 页面随着`data`变化完毕之后自动执行
+ `beforeUnmount`: `Vue`应用失效的时候立即执行的函数
+ `unmounted`: `Vue`应用失效，且`dom`完全销毁之后，自动执行的函数

### 3. 属性
+ 计算属性`computed`, 方便对固定的属性进行计算，带有缓存的效果，<font color=#3eaf7c>使用的比较广泛</font>
+ 监听属性`watch`方便在监听的属性变化后做对应的一系列改变，比如某个值改变了要去发送`http`请求就可以使用监听`watch`属性。


