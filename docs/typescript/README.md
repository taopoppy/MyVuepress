# 入门概述

## Hello TypeScript

### 解除对TypeScript的误解
1. 首先TypeScript并不是JavaScript的孪生兄弟，也并不是一门新的语言
2. 可以将TypeScript理解为加了一身装备铭文的**进化版的JavaScript**，JS有的，TS都有，而且做的更好，JS没有的，TS也有，而且在很长的时间内不会被JS追赶上

### TypeScript的优势
1. 始终紧跟ECMAScript标准，ES56789等新语法的标准都是支持的，而且在语法层面上进行了一些拓展，比如枚举(enum)这种数据类型，对类(class)实现了一些ES6中没有确定的语法标准等
2. ES6789这些具有新特性的代码顺利运行在非现代浏览器需要借助Bbel这种编译工具，将其转化为ES3/5版本，但是TypeScript不需要Babel就能将代码编译为指定的版本标准的代码
3. 在**编译过程**就能对错误进行检查，甚至当使用VSCode和TSLint后，在**编写代码**得时候就能准确的提醒你相关的错误

### TypeScript的发展趋势
1. JavaScript是一门动态脚本语言，不需要编译成为二进制代码运行，这个特定使得JS的所有调试都需要在运行的时候才能进行，在编写代码的时候是无法知晓的，而且这个特点还会持续很长时间。但是TypeScript可以在编写代码的时候就对一些错误进行提示，所以多人合作的项目对一些变量和接口进行强校验是非常需要的，这时TS就是最佳的选择
2. 适合使用TS开发的项目种类有下面这些：
  + 需要多人合作开发的项目
  + 开源项目，尤其是工具函数或者组件库
  + 对代码质量有很高要求的项目


## TypeScript应该怎么学习

### 看文档
  + 看[英文官网文档](http://www.typescriptlang.org/docs/home.html)，因为英文文档是及时更新的，如果TS更新导致有些知识的变化，我们应该对比自己的版本和官网文档的最新版本，然后到更新日志当中去查找这部分知识的更新记录

### 看报错
  + 查看报错类型，确定是TS报错还是TSLint报错,如果是TSLint报错，在鼠标移动到红色波浪线后，在弹出的方框的右上角会有tsLint()的样式，在括号中就是报错的规则名，报错的规则名可以在tslint.json中去制定
  + 如果是ts类型的错误，在弹出框中的错误信息后面会有ts()的样式，括号中的代码就是错误代码
  + 第三种错误就是运行时的报错，这种错误需要在浏览器控制台中查看，尤其是你调试的是node服务端的项目，就要在终端去查看

### 看声明文件
  + 学着看声明文件，看看它对一些内容的声明是如何定义的，能够帮你见识到各种语法的运用，看库的声明文件能够帮助你提高对TS的了解程度

### 学会Google和看issue
  + 尽量学会使用搜索引擎去搜索问题
  + 在TS的官方仓库，在[issues](https://github.com/Microsoft/TypeScript/issues)中使用**关键字**查询问题，而不是完整的报错信息

### 看优秀的项目源码
  + 在github的左上角去搜索项目名称
  + 在language那一栏中去选择TypeScript就可以看到使用TS写的源码，但是当然要看一下star数高的

## VSCode揭秘和环境的搭建
  
### 汉化
1. 如果你英语不是很好，配置中文版界面是很有必要的，安装个插件就可以了。打开 VSCode 之后在编辑器左侧找到这个拓展按钮，点击，然后在搜索框内搜索关键字"Chinese"，这里图中第一个插件就是。直接点击 install 安装，安装完成后重启 VSCode 即可。

### 编辑器配置
1. 有一些编辑器的配置需要在项目的根目录下创建一个.vscode文件夹，里面创建一个setting.json文件，当然我们还需要在vscode中安装[EditorConifg for Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)，就是一个白色老鼠的插件，我们下面看一下setting.json中的配置
```json
{
  "tslint.configFile":"./tslint.json", 
  "tslint.autoFixOnSave":true,
  "editor.formatOnSave":true
}
```
我们看一下这些配置的意思:
  + **tslint.configFile**: 用来指定tslint.json文件的路径，注意这里是相对根目录的；
  + **tslint.autoFixOnSave**: 设置为true则每次保存的时候编辑器会自动根据我们的tslint配置对不符合规范的代码进行自动修改；
  + **editor.formatOnSave**: 设为true则编辑器会对格式在保存的时候进行整理。

### TS相关插件
1. **[TSLint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint)**:  是一个通过tslint.json配置在你写TypeScript代码时，对你的代码风格进行检查和提示的插件。关于TSLint的配置，我们会在后面讲解如何配置，它的错误提示效果在我们之前的例子已经展示过了。
2. **[TSLint Vue](https://marketplace.visualstudio.com/items?itemName=prograhammer.tslint-vue)**:  加强了对Vue中的TypeScript语法语句进行检查的能力。如果你使用TypeScript开发Vue项目，而且要使用TSLint对代码质量进行把控，那你应该需要这个插件。

### 提升开发体验的插件
1. **[Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag)**:  插件会自动帮你补充HTML闭合标签，比如你输完&lt;button&gt;,的后面的尖括号后，插件会自动帮你补充
2. **[Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)**:  插件会在你修改 HTML 标签名的时候，自动帮你把它对应的闭标签同时修改掉；
3. **[Bracket Pair Colorizer](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer)**:  插件会将你的括号一对一对地用颜色进行区分，这样你就不会被多层嵌套的括号搞晕了，来看看它的样子：
4. **[Guides](https://marketplace.visualstudio.com/items?itemName=spywhere.guides)**: 插件能够帮你在代码缩进的地方用竖线展示出索引对应的位置，而且点击代码，它还会将统一代码块范围的代码用统一颜色竖线标出，如图：

### 用户代码片段
1. 一些经常用到的重复的代码片段，可以使用<code>用户代码片段</code>，配置，这样每次要输入这段代码就不用一行一行敲了，直接输入几个标示性字符即可。在 VSCode 左下角有个设置按钮，点击之后选择【用户代码片段】，在弹出的下拉列表中可以选择【新建全局代码片段文件】，这样创建的代码片段是任何项目都可用的；可以选择【新建"项目名"文件夹的代码片段文件】，这样创建的代码片段只在当前项目可用。创建代码片段文件后它是一个类似于json的文件，文件有这样一个示例：
```json
{
 "Print to console": {
        "prefix": "java_model",
        "body": [                   
            "public class $TM_FILENAME_BASE {",
            "   public static void main (String[] args){",
            "      System.out.println();",
            "   }",
            "}"
                
        ],
        "description": "Java Model"
    }
}
```

## 搭建项目