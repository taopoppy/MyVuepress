# 部署

## 部署和总结
### 1. 提交远程仓库

如果你一开始就创建了一个远程仓库，然后开发的过程一直是开发和提交，现在就不需要这个过程了。

如果你一直是在本地开发，我们需要先将代码提交到某个仓库，现在项目的根目录执行：
```javascript
git init
```
然后添加`.gitignore`文件，将`.next`和`node_modules`忽略，因为这两个是不应该提交到服务器上面的，接着我们提交到本地的工作区：
```javascript
git add .
git commit -m 'init project'
```
接着我们去线上提交，那提交的话你需要到`git`或者`gitee`上面创建一个空的项目，从项目当中拿到`ssh`的提交地址，但是光有地址不行，你还要有权限，你需要在`git`或者`gitee`上面的`ssh公钥`的地方添加一个你本地的公钥和线上服务器的公钥。

这个公钥怎么生成呢?
+ 在命令中执行`ssh keygen.exe`，一路`enter`即可
+ 然后在执行`cat C:\Users\Administrator\.ssh\id_rsa.pub`，就会在命令行中显示你的公钥，当然你也可以直接去文件中，打开文件复制这个公钥码
+ 添加这个码到`git`或者`gitee`上面的公钥设置即可

接着回到项目根目录，添加远程仓库地址，然后提交
```javascript
git remote add origin 你的远程仓库的ssh地址
git push origin master
```



### 2. 部署前的修改
在部署之，我们还要改一些内容

<font color=#1E90FF>**① 修改正式环境的启动命令**</font>

修改`package.json`中的`start`命令：
```javascript
"script": {
	"start": "cross-env NODE_ENV=production node server.js"
}
```

<font color=#1E90FF>**② 修改回调地址**</font>

回到`github`的设置当中去修改之前的回调地址，在`OAuth APPS`当中修改`Homepage URL`和`Authorization callback URL`:
```javascript
// 修改前
"Homepage URL": http://localhost:3000
"Authorization callback URL": http://localhost:3000/auth

// 修改后
"Homepage URL": http://你的域名
"Authorization callback URL": http://你的域名/auth
```
然后点击`Update Application`来更新设置

<font color=#1E90FF>**③ 添加pm2的配置文件**</font>

创建`ecosystem.config.js`：
```javascript
// pm2配置文件

module.exports = {
	apps: [
		{
			name: 'next-project', // 启动在pm2的项目名称
			script: './server.js', // 启动文件
			instance: 1, // 1个实例
			autorestart: true, // 自动重启
			watch: false,
			max_memory_restart: '1G', // 使用内存超过1G就重启
			env: {
				NODE_ENV: 'production' // 启动server.js携带环境变量
			}
		}
	]
}
```

以上的关于项目内容的修改，在修改后记得重新提交。

### 3. 连接服务器
<font color=#1E90FF>**① 克隆项目**</font>


在本地执行下面的命令：
```javascript
ssh 你的服务器的ip地址
```
然后输入密码进入即可，当然也可以通过`X-shell`工具连接服务器都是可以的,然后将远程仓库中的项目克隆到服务器上面：
```javascript
git clone 你的远程仓库的ssh地址
```
然后进入项目，使用下面的命令下载安装包：
```javascript
yarn
yarn build
```

<font color=#1E90FF>**② nginx代理**</font>

项目直接启动时无法通过外网访问的，因为`Linux`是一个安全的服务器，你要主动开启端口才行，但是我们可以使用`nginx`去代理
```javascript
yum install nginx
cd /etc/nginx/
```
进入到`nginx`的文件目录可以看到有两个比较重要的文件是`conf.d`和`default.d`文件，然后`cd conf.d`中创建一个`next.conf`的文件，内容如下：
```javascript
server {
	listen 80;
	listen [::]:80;
	server_name 你的域名;

	location / {
		proxy_pass http://localhost:3000;
		proxy_set_header Host $host:$server_port;
	}

}
```
然后执行下面的命令重启`nginx`：
```javascript
service reload nginx
```

<font color=#1E90FF>**③ 启动redis服务**</font>

更新安装源来安装最新的包
```javascript
sudo yum install epel-release
sudo yum update
```

安装`redis`
```javascript
sudo yum install redis
```

后台启动`redis`
```javascript
sudo systemctl start redis
```

设置开机启动`redis`
```javascript
sudo systemctl enable redis
```
如果是`ubuntu`我们就将上面所有命令当中的`yum`改成`apt-get`即可。

<font color=#1E90FF>**④ pm2启动项目**</font>

首先下载`pm2`：
```javascript
npm i -g pm2
```
然后在项目的根路径中启动：
```javascript
pm2 start ecosystem.config.js
```
然后可以通过`pm2 list`来查看我们启动是否正确，正确的话，应该在列表中有`next-project`的启动状态为`online`