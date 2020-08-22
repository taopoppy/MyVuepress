# rpx响应式单位和flex布局

## 创建项目准备
小程序创建页面有两个步骤：
+ <font color=#1E90FF>在pages当中创建一个页面名称的文件夹，比如index</font>
+ <font color=#1E90FF>右击index文件夹，然后选择<font color=#9400D3>新建Page</font>，然后再次输入index，则会自动帮你创建4种类型的文件，然后并自动在app.json的page属性中添加上页面路径</font>

当然小程序默认的第一个页面是`app.json`当中`pages`数组中的第一项，后续新创建的页面的路劲都默认添加到`pages`数组的最后一项，当然了这些很人性化的小程序自动操作都要在你的程序代码没有写错的前提下才会自动进行，而且小程序中的`app.json`中的`pages`数组只会自动添加，不会自动删除，如果删除掉某个页面，要自己去`app.json`的`pages`数组中删除对应的一项。

