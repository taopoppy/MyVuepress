# 编写第一个Typescript
1. 在全局安装了typescript和tslint后，我们就能去编写ts代码，并且可以通过tsc去编译ts文件，tsc能将ts文件编译成为js文件
2. 函数的参数类型和数量都会在ts当中报出错误，因为tslint就能帮助你去检查
3. 理解接口，接口interface就是一种规则，一旦数据是接口类型的，数据的结构就要满足接口指定的规则但是经过tsc编译过后，在js文件interface这些东西就全部被干掉了
4. 然后类是一种语法糖，当经过tsc编译后就是一种立即函数执行去实现一个对象，具体代码如下:
```typescript
class User {      
  fullName:string                                             var User = /** @class */ (function () {
  firstName:string                                                 function User(firstName, lastName) {
  lastName:string                                                     this.firstName = firstName;
  constructor(firstName:string,lastName:string) {        =>           this.lastName = lastName;
    this.firstName = firstName                                        this.fullName = firstName + ' ' + lastName;   
    this.lastName = lastName                                       }
    this.fullName = firstName + ' ' + lastName                     return User;
  }                                                           }());
}
```