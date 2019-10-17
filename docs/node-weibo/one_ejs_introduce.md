# ejs模板引擎介绍

我们首先在`app.js`当中注册了所有`ejs`的文件夹`views`，所以当我们的路由通过`ctx.render`方法就可以直接找到文件和传递参数：
```javascript
router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})
```
+ <font color=#CC99CD>这段代码的意思就是当你访问根路由的时候，我们会到view目录下去找这个index.ejs文件，然后通过第二个参数来渲染index.ejs当中的所有内容，渲染完毕就把结果以html的方式返回给客户端。</font>

+ <font color=#DD1144>为什么我们使用ctx.render的时候使用await，也就是使用异步的方式去渲染的？实际上渲染模板的过程是读取模板文件的过程，属于读取文件这种I/O操作，在node中所有I/O文件都是异步的，所以一定要加这个await关键字，否则如果是同步的话还没与来得及读取完文件内容就返回了</font>

基本上`ejs`在`koa2`最简单的渲染过程我们已经说完了，下面我们来说说`ejs`模板中的具体使用。

## 变量
根据上面的过程我们是向模板传入了一个`title`的变量，然后我们在模板当中以这样的方式去获取并渲染的：
```html
  <title><%= title %></title>
```

在`ejs`模板当中对变量有严格的控制，如果在`ejs`书写的模板变量后端在渲染的时候没有传入对应的值，就会报错，所以我们的解决方法是：
+ <font color=#DD1144>对于我们不确定是否后端会传入的变量我们需要在ejs模板当中添加locals前缀来防止报错</font>
  ```html
  <p><%= locals.name %></p>
  ```
## 判断和循环
其实对于判断语句来说也比较简单，几乎就像在写`javascript`语句一样，只不过每行的左右分别要用`<% %>`包裹起来,语句中的变量仍热需要使用`<%= %>`进行包裹
```html
  <div>
    <% if(isMe) { %>
      <a href="#"> @ 提到我的（<%= locals.msgNum %>）</a>
    <% } else { %>
      <button>关注</button>
    <% }%>
  </div>
```

而循环也不是和我们在`vue`当中有什么指令，也是书写`javascript`的方式，如下：
```html
<ul>
  <% blogList.forEach(blog => { %>
    <li data-id="<%= blog.id %>"><%= blog.title %></li>
  <% }) %>
</ul>
```


## 引用组件
我们首先在`src/views/widgets/user-info.ejs`当中写如下内容:
```html
<div>
  <% if(isMe) { %>
    <a href="#"> @ 提到我的（<%= locals.msgNum %>）</a>
  <% } else { %>
    <button>关注</button>
  <% } %>
</div>
```
然后我们在`src/views/index.ejs`中调用这个组件：
```html
<%- include('widgets/user-info',{
  isMe,
  msgNum
}) %>
```
所以组件的引用使用的是这样的方式：<font color=#DD1144><%- include('组件路径'，参数对象)%></font>

这里有个特别注意的点就是，有时候我们在引用顶级变量的时候我们是不需要写`include`的第二个参数的，原因如下：
+ <font color=#CC99CD>包含的内容在运行时插入，在你顶级数据对象中的变量都可以用于所有的包含，而局部变量需要传递进来，如下</font>
  ```html
  <ul>
    <% users.forEach(function(user){ %>
      <%- include('user/show', {user: user}) %>
    <% }); %>
  </ul>
  ```
很简单，因为`user`变量已经不是顶级变量了，需要传值进去，但是我推荐的做法是这样：
+ <font color=#1E90FF>但为了组件的复用性，我还是习惯将组件内部的都作为私有变量使用，有传递关系，这样变量的来源就更加清晰了</font>
  

## 关于ejs
这里还有个很重要的概念：<font color=#3eaf7c>SSR</font>,其实`SSR`的意思是服务端渲染，<font color=#CC99CD>只要是通过服务端返回的html都叫做SSR</font>，所以其实`SSR`技术并不是什么创新技术，在`React`和`Vue`当中都只是借鉴了以前的技术

所以`SSR`渲染的技术前端拿到的都是已经有结果的`html`页面了，而`Vue`和`React`你看其实是一大堆`JS`,是通过`JS`发送`ajax`从后端拿到数据再局部渲染到当前页面。

所以`SSR`并不是什么高大上的技术，而且本身和`Vue`和`React`没有啥关系，甚至这种技术的雏形在上世纪90年代就有了，用`java`实现`SSR`的技术就是`jsp`，并不是用`java`去实现一个`Vue`或者`React`,谁现在还学`jsp`谁就是想返回上个世纪。

最后我们提交代码，当然我建议你在提交的时候使用`git diff`来检查一下修改的东西
```javascript
git diff
git add .
git commit -m 'feat：ejs演示'
git push origin master
```
