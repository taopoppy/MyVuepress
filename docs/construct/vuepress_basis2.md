# 上传到服务器

## 上传到github(方法一)
1. 在github上创建username.github.io的项目(这里的username指你的github用户名，我的是taopoppy，所以我创建的项目名称就是taopoppy.github.io),特别要注意的是这个命名方式是固定的，以这种形式创建项目，github就会自动开启Code Page功能，能直接通过域名https://username.github.io 访问你项目中的静态文件
2. 在本地的vuepress项目中添加deploy.sh文件,内容如下：
```sh
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
git push -f git@github.com:taopoppy/taopoppy.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```
3. 在package.json中添加命令，如下：
+ <code>docs:dev</code>是用来在本地启动项目的命令
+ <code>docs:build</code>是用来打包的，打包的文件在docs/.vuepress/dist目录下
```json
{
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
}
```
4. 在项目目录blog中执行: bash deploy.sh

## 上传到github(方法二)
1. 在github当中创建一个myvuepress的项目
2. 在本地的vuepress项目中添加deploy.sh文件,内容如下：
```sh
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:taopoppy/taopoppy.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:taopoppy/myvuepress.git master:gh-pages

cd -
```
3. 我们需要在.vuepress/config中配置
```typescript
module.exports = {
  base: '/myvuepress/'
}
```
4. 在项目目录blog中执行: 
```
bash deploy.sh
```
5. 访问的路径就不再是taopoppy.github.io,而是taopoppy.github.io/myvuepress

## 绑定到独立的域名
1. 买域名www.taopoppy.cn(这里是我买的域名，你自己需要买你自己的域名，买域名推荐到[万网](https://wanwang.aliyun.com/),在首页先查询并购买即可)
2. 在控制台上ping出taopoppy.github.io的IP(这里将taopoppy.github.io换成你github的账号usename.github.io)
```
ping taopoppy.github.io
```
3. DNS解析：添加记录主机记录@和www,记录值为上面解析出的IP,如果你不会的话，参照[官网文档](https://help.aliyun.com/document_detail/29716.html)
4. 回到github,在setting中的custom domain中添加www.taopoppy.cn，然后项目中会多出一个CNAME的文件，内容就是
```
www.taopoppy.cn
```