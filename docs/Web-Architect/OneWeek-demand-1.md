# 需求设计分析

## 明确目标
架构师的职责是什么？架构师的职责就是
+ <font color=#1E90FF>第一基于业务，深入业务需求，基于复杂和真实的业务场景下，使用软件去把业务模拟出来，并且保证稳定执行和后续增长，不一定使用什么高大上的技术和框架</font>
+ <font color=#1E90FF>第二基于技术，能够为现有的团队构建工程体系，研发流程和项目管理，运维体系</font>

如何成为一个前端架构师呢?
+ <font color=#1E90FF>真实的架构设计过程</font>
+ <font color=#1E90FF>真实的商业级项目</font>
+ <font color=#1E90FF>大型复杂的业务</font>
+ <font color=#1E90FF>完善的工程体系</font>：`CI/CD`、单元测试、接口测试，发布测试机、上线回滚
+ <font color=#1E90FF>完善的运维体系</font>：线上统计，监控和报警，安全预防，异常处理
+ <font color=#1E90FF>研发流程+项目管理</font>：大厂的研发流程规范，任务拆分，多人协作，代码审查，项目沟通
+ <font color=#1E90FF>前沿+全面的前端技术栈</font>

<font color=#9400D3>所以架构师的职责是通过技术实现业务的增长，需求和设计是最重要的</font>

<img :src="$withBase('/web_jiagoushizhize.png')" alt="">

本周的收获有下面这些：
+ <font color=#DD1144>规范的产品研发流程</font>
+ <font color=#DD1144>熟悉产品需求</font>
+ <font color=#DD1144>（重点）学会以架构师的思维分析需求，理解需求</font>
+ <font color=#DD1144>《整体技术方案设计》文档</font>
+ <font color=#DD1144>（重点）学会如何写技术方案设计</font>

主要内容
+ <font color=#DD1144>学会如何以架构师思维分析需求</font>
+ <font color=#DD1144>由浅入深的需求分析</font>
+ <font color=#DD1144>（重点）架构设计-多项目之间的关系</font>
+ <font color=#DD1144>（重点）核心数据结构设计</font>
+ <font color=#DD1144>写《技术方案设计》文档</font>

关键词
+ <font color=#1E90FF>流程图</font>：分析需求的工具
+ <font color=#1E90FF>思维</font>：全局思维，整体思维，闭环思维，统称架构师思维
+ <font color=#1E90FF>业务组件库</font>：独立拆分，复用
+ <font color=#1E90FF>自定义事件统计</font>：业务的重要性，如何实现

注意事项
+ 架构师不要关注细节，要看整体，看范围
+ 设计时判断可行性，不确定就调研一下（需要大量的工作经验，技术能力）
+ 设计要考虑复杂度，越简单越好，不要过度设计，不要为了设计而设计

## 产品研发流程
我们来熟知一下产品的研发流程：

<img :src="$withBase('/web-project-process.png')" alt="">

## 架构师分析需求
<font color=#1E90FF>一般的程序员思考问题比较局限，因为大部分时间都在做具体的功能点，而架构师要从整体进行分析</font>，特别要在分析需求的时候注重下面这三个关键词：
+ <font color=#9400D3>全面</font>：我们所有相关的功能都很全面
+ <font color=#9400D3>完整</font>：流程从头开始到尾部，不会虎头蛇尾
+ <font color=#9400D3>闭环</font>：有输入有输出

我们来拿一个简单的抽奖例子去画一个流程图：

<img :src="$withBase('/web-choujiang.png')" alt="">

图中的<font color=#1E90FF>登录</font>、<font color=#1E90FF>引导分享</font>、<font color=#1E90FF>统计</font>都是我们一般的程序员想不到的，实事求是，大部分人第一思维就是一个抽奖接口而已，所以要想成为架构师，要先拓宽自己的思维，多往全面的方向和完整的方向去思考。

包括上面这个图也是我自己使用`ProcessOn`画出来的，工作讲究和`PM(产品经理)`和`RD(后端接口开发)`共同协作，但是思维和视野是只能靠自己去拓宽的。

## 项目浅层需求
<font color=#1E90FF>浅层需求一定要去解读需求，去深入理解需求</font>，我们的核心是：<font color=#DD1144>需求引导设计，设计指导开发</font>

项目浅层需求就是可以从表面能够看出来的一些东西：
+ 登录，注册，获取用户信息，创建作品，编辑作品，保存作品，发布作品，访问作品，获取作品信息，获取作品列表，模板列表，使用模板创建等等

## 项目深度需求
什么是<font color=#9400D3>深度需求</font>呢？就是一眼看不出来，或者客户想要某个功能，但是表达不出来的的需求。<font color=#1E90FF>深度需求的解决经常需要很多个代码仓库来实现</font>

+ <font color=#1E90FF>作品的管理</font>
	+ 删除和恢复
	+ 转赠（员工离职将账号转赠送给其他同事）
	+ 复制

+ <font color=#1E90FF>作品统计</font>
	+ <font color=#DD1144>统计</font>
	+ <font color=#DD1144>分渠道统计，对于运营人员非常重要</font>：比如网站的链接会被各种平台访问，可以通过统计不同渠道的访问量，然后根据情况进行下一步的计划

<font color=#DD1144>统计可以表现需求闭环，有输入有输出，类似于B站你发布了作品你得能看到多少人浏览过你的作品，多少人给你点了赞，投了币</font>

+ <font color=#1E90FF>作品发布</font>
	+ `url`不能变
	+ 支持多渠道

+ <font color=#1E90FF>分享</font>
	+ <font color=#DD1144>体现的是对业务增长的负责</font>

+ <font color=#1E90FF>后台管理</font>
	+ 数据统计（用户数量，作品数量，模板数量，pv/uv）
	+ <font color=#1E90FF>作品管理</font>：能够快速下线作品，防止有违规内容
	+ <font color=#1E90FF>用户管理</font>：能快速冻结用户，防止有违规用户
	+ <font color=#1E90FF>模板管理</font>：能控制那些模块能展示，哪些不能展示

## 需求总结（闭环分析）
<img :src="$withBase('/web_analyze_image.png')" alt="">

需求分析要坚持<font color=#DD1144>全面完整闭环</font>的原则，现在可以总结一下我们整个是如何使用架构师的思维去分析需求的：
+ <font color=#1E90FF>浅层分析</font>：（客户提出的需求和一个项目基础的功能）
+ <font color=#1E90FF>深层分析</font>：（基于技术方面和运营方面对需求进一步细化）
+ <font color=#1E90FF>需求总结</font>：（闭环，基于不同角色有输入有输出考虑需求）