# 实现JWT

## node中使用JWT
### 1. 安装`jsonwebtoken`这个包：
```bash
npm install jsonwebtoken
```
然后我们本次先使用的命令行的方法，打开`vscode`的命令行，在终端的项目路径中输入`node`，我们就在这个环境下测试

### 2. 签名
```javascript
C:\Users\Administrator\Desktop\REST-API>node
> jwt = require('jsonwebtoken')
{ decode: [Function],
  verify: [Function],
  sign: [Function],
  JsonWebTokenError: [Function: JsonWebTokenError],
  NotBeforeError: [Function: NotBeforeError],
  TokenExpiredError: [Function: TokenExpiredError] }
> token = jwt.sign({name:'taopoppy'},'secret')
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGFvcG9wcHkiLCJpYXQiOjE1NjUxNjY1MDl9.6zlun7j_pdLz-PpwhctDpzYSM498A-Y8XiHOdYr1vvM'
>
```
可以看到，我们使用<font color=#CC99CD>jwt.sign</font>方法输入用户信息和秘钥就能生成`token`

### 3. 验证
那么服务端怎么验证呢，必须先验证用户是谁，通过解码的方式,这里有两个方法注意,<font color=#CC99CD>jwt.decode</font>和<font color=#CC99CD>jwt.verify</font>
```javascript
> jwt.decode(token)
{ name: 'taopoppy', iat: 1565166509 }
```
`jwt。decode`只是对令牌进行简单的`base64`的解码，但是不能证明用户信息是否正确，所以我们必须要在解码的同时验证用户信息是否被篡改，所以我们要加上秘钥，使用`jwt.verify`方法
```javascript
> jwt.verify(token,'secret')
{ name: 'taopoppy', iat: 1565166509 }
>
```
虽然上述代码中两个方法结果一样，因为我们只是演示了一下，但是第二个方法`jwt.verify`验证的结果是可靠的，用户信息是没有被篡改过的。如果你使用错误的秘钥和错误的`token`，使用`jwt.verify`就无法验证通过，这就保护了用户信息的安全性
