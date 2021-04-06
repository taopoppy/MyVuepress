# 前端工程化

## 什么是前端工程化
我们先来看看这一章的学习内容：

<img :src="$withBase('/projectable-devtools.png')" alt="">

什么是前端工程化？<font color=#DD1144>前端工程化指的是将前端开发的流程规范会，标准化，包括开发流程，技术选型，代码规范，构建发布等，用于提升前端工程师的开发效率和代码质量</font>

+ <font color=#DD1144>开发流程</font>：需求分析，版本控制，缺陷管理，文档管理，自动化，性能测试，发布部署

+ <font color=#DD1144>技术选型</font>：UI框架，Js框架

+ <font color=#DD1144>代码规范</font>：`Standard`、`airbnb`、`Prettier`，模块化

+ <font color=#DD1144>构建发布</font>：`Jenkins`、`Webpack`、`Gulp`、`Docker`

也并不是我们所有的东西都要学习，人的精力是有限的，但是从广泛的意义讲，很多东西你要知道，具体遇到问题就有解决问题的思路和方向。在现在对前端工程化有了更加细致的划分，比如下面这种：

<font color=#1E90FF>前端工程可以定义为，将工程方法系统化地应用到前端开发中，以系统、严谨、可量化的方法开发、运营、维护前端应用程序</font>

前端越来越重，复杂度越来越高，配套的前端工程体系也在不断发展和完善，可简单分为开发、构建、发布 3 条主线：
+ <font color=#9400D3>前端框架</font>：插件化（`jQuery`） -> 模块化（`RequireJS`） -> 组件化（`React`）
+ <font color=#9400D3>构建工具</font>：任务化（`grunt/gulp`） -> 系统化（`webpack`）
+ <font color=#9400D3>CI/CD</font>：工具化（`Jenkins`） -> 自动化（`Web Hook`）

三大主线撑起了前端工程体系，系统地覆盖了前端开发的主流程，其中的工程方法也彼此互补、相互影响，体现在：
+ 构建工具让百花齐放前端框架、类库能够无缝合作
+ 前端框架、类库也在一定程度上影响着构建工具（如模块加载、CSS 预处理）、甚至`CI/CD`（如`SSR`）

<font color=#1E90FF>**① 开发阶段**</font>

开发阶段的首要任务是创建样板项目（一并选择前端框架、类库），接着开始修改-验证的主循环，主要涉及这些工程化设施：

+ 脚手架：创建前端应用的目录结构，并生成样板代码
+ 公共库：维护着可复用的 UI 组件、工具模块等公共资源
+ 包管理器：引入第三方库/组件，并跟踪管理这些依赖项
+ 编辑器：提供语法高亮、智能提示、引用跳转等功能，提升开发体验
+ 构建工具：提供语法校验、编译、打包、`DevServer`等功能，简化工作流
+ 调试套件：提供预览、`DevTools`、`Mock`、性能分析诊断等调试功能，加速修改-验证的主循环

<font color=#1E90FF>**② 测试阶段**</font>

开发完成，进入测试阶段，先要对整体功能进行充分自测，再移交专业的测试人员验证，过程中需要用到工程化设施有：

+ 单元测试框架：提供针对组件、逻辑的测试支持
+ 静态扫描工具：从代码质量、构建产物质量、最佳实践/开发规约等多个维度做静态检查
+ 自动化测试工具：针对 UI 效果和业务流程，提供测试支持
+ 性能测试工具：监测并统计出相对准确的性能数据

<font color=#1E90FF>**③ 构建阶段**</font>

不同于开发阶段，在构建阶段要做更多的极限优化和流程联动，涉及：
+ 打包脚本：在语法校验、编译、打包的基础上，进行合并、压缩、代码拆分、图片处理、SSR等极限优化
+ 构建服务：支持多任务并行打包、通知

<font color=#1E90FF>**④ 部署阶段**</font>

最后将经过充分测试的前端应用程序部署到生产环境，需要这些工程化工具：
+ 发布平台：将前端资源上传至`CDN`或`SSR`渲染服务，或者以离线包的形式集成到移动客户端
+ 迭代管理平台：提供`CI/CD`支持

<font color=#1E90FF>**⑤ 监控阶段**</font>

前端应用程序上线之后，还需要持续关注线上的实际效果和异常情况，依赖这些工程设施：
+ 埋点平台：统计、分析业务数据，跟踪性能指标
+ 监控平台：观察线上的异常信息，包括报错、白屏、流量异常等

## 怎么做前端工程化
前端工程化也是有规模的，并不是所有项目都需要很复杂的前端工程化

比如小的团队，可以从<font color=#1E90FF>业务</font>着手，简单的单页面应用，使用`gulp`打包+ 同步工具实现开发全流程

如果是比较复杂的项目，我们就可以考虑现有成熟化的产品，比如`Jenkins`(CI工具)+`git/gitlab`(版本控制工具)+`webpack`(构建工具) + `React/Vue`(前端框架)

<img :src="$withBase('/bigfrontend-devop-14.png')" alt="">