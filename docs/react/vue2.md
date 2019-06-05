# 编写基础请求代码

我们这节课开始编写 `ts-axios` 库，我们的目标是实现简单的发送请求功能，即客户端通过 `XMLHttpRequest` 对象把请求发送到 server 端，server 端能收到请求并响应即可。

我们实现 `axios` 最基本的操作，通过传入一个对象发送请求，如下：

```typescript
axios({
  method: 'get',
  url: '/simple/get',
  params: {
    a: 1,
    b: 2
  }
})
```

## 创建入口文件

我们删除 `src` 目录下的文件，先创建一个 `index.ts` 文件，作为整个库的入口文件，然后我们先定义一个 `axios` 方法，并把它导出，如下：

```typescript

function axios(config) {

}

export default axios

```

这里 TypeScript 编译器会检查到错误，分别是 `config` 的声明上有隐含的 `any` 报错，以及代码块为空。代码块为空我们比较好理解，第一个错误的原因是因为我们给 TypeScript 编译配置的 `strict` 设置为 `true` 导致。

### 编译配置文件 tsconfig.json

`tsconfig.json` 文件中指定了用来编译这个项目的根文件和编译选项，关于它的具体学习，我希望同学们去[官网](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)系统学习一下

我们在之前讲 TypeScript 的基础时，会运行 `tsc` 命令去编译 TypeScript 文件，编译器会从当前目录开始去查找 `tsconfig.json` 文件，作为编译时的一些编译选项。

我们来看一下 tsconfig.json 文件，它包含了很多编译时的配置，其中我们把 `strict` 设置为 `true`，它相当于启用所有严格类型的检查选项。启用 `--strict` 相当于启用 `--noImplicitAny`,`--noImplicitThis`,`--alwaysStrict`，`--strictNullChecks` 和 `--strictFunctionTypes` 和 `--strictPropertyInitialization`。

我们讲 TypeScript 的基础时提到了 `--strictNullChecks`，其它的编译配置我建议同学们都去查看它的[官网文档](https://www.typescriptlang.org/docs/handbook/compiler-options.html)，把它当做手册去查阅即可。

### 定义 AxiosRequestConfig 接口类型

接下来，我们需要给 `config` 参数定义一种接口类型。我们创建一个 `types` 目录，在下面创建一个 `index.ts` 文件，作为我们项目中公用的类型定义文件。

接下来我们来定义 `AxiosRequestConfig` 接口类型：