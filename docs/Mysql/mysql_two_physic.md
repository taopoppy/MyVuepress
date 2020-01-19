# 数据库物理设计

## Innodb
### 1. 存储引擎的选择
一般来说，表的物理设计包括表中每一列使用的数据类型，以及如何对表和库进行命名，<font color=#1E90FF>但是对于mysql来说呢，还要选择表所存储的存储引擎，mysql支持多种存储引擎，存储引擎又决定了表中实际数据存储的数据结构</font>。

为了能选择适合的存储引擎，我们首先要知道有哪些存储引擎可供我们选择：

<font color=#DD1144>**① MYISAM**</font>

事务为N，是`mysql`5.6之前的默认引擎，最常用的非事务性存储引擎，并不支持事务，同时在整个引擎中，<font color=#1E90FF>数据是以堆表的方式进行存储的</font>，并无特定的顺序。

<font color=#DD1144>**② CSV**</font>

事务为N，<font color=#1E90FF>使用csv文件格式来存储数据</font>，可以直接修改`CSV`文件的内容来修改表中的数据，和`MYISAM`一样，由于不支持事务，读写会枷锁，<font color=#1E90FF>所以我们通常使用csv来进行不同系统的数据交换</font>，但并不建议作为核心存储引擎来使用

<font color=#DD1144>**③ Archive**</font>

事务为N，适用场景极其特殊，<font color=#1E90FF>只允许查询和新增数据而不允许修改已有数据的非事务性存储引擎</font>，所以我们通常使用它来归档数据来记录日志的用途。

<font color=#DD1144>**④ Memory**</font>

事务为N，<font color=#1E90FF>是一种易失型非事务性存储引擎</font>，由于数据存储在内存当中，读写速度很快，适合I/O操作。但是一旦`mysql`实例重启，存储在`Memory`存储引擎中的数据就会消失，所以也不适合作为业务的核心存储引擎来使用。<font color=#1E90FF>这个存储引擎一般在mysql内部使用，执行比较长的sql会产生大量中间数据集，使用这种存储引擎来存储这种临时数据会提高sql语句的执行速度</font>

<font color=#DD1144>**⑤ INNODB**</font>

事务Y，<font color=#1E90FF>是mysql5.6之后默认的最常用的事务性存储引擎</font>

### 2. INNODB概述
`Innodb`的特点：
+ <font color=#3eaf7c>支持事务（ACID）</font>，其完全支持事务的原子性，一致性，隔离性和持久性，在需要事务支持的场景中，<font color=#1E90FF>一定不要混合使用事务性存储引擎和非事务存储引擎</font>
+ <font color=#3eaf7c>数据按主键聚集存储</font>：数据在逻辑上按照表中主键的顺序来存储的，一般建议有一个自增的id来作为主键使用的。<font color=#DD1144>按照之前的我们的业务设计，就需要给每个表添加一个自增id列来作为表的数据库主键，而之前的业务主键可以添加一个唯一索引，保证数据的唯一性</font>
+ <font color=#3eaf7c>支持行级锁及MVCC</font>:在读写的时候只会在读写的数据行上来枷锁，并不会想`MYISAM`在整个表上来枷锁。支持`mvcc`(多版本的并发控制)，可以进一步处理读写操作的互相阻塞，非常适合在这种读写混合的高并发场景中使用。
+ <font color=#3eaf7c>支持Btree和自适应Hash索引</font>
+ <font color=#3eaf7c>支持全文和空间索引</font>

### 3. 优化表结构
根据上述的`INNODB`的这些特点，我们给每个表添加一个自增id来作为数据库表的主键使用。通常这个数据库主键要比这个业务主键小很多，所以表和表之间的关联也可以依靠数据库主键来运行，这样比业务主键关联查询会更有效率。通过上述操作后我们再来看看表的结构的变化：
+ <font color=#3eaf7c>课程表</font>：<font color=#DD1144>课程ID</font>(<font color=#1E90FF>自增ID:1,2,3,4...</font>)，主标题，副标题，方向ID，分类ID，难度ID，上线时间，学习人数，时长，简介，需知，收获，讲师ID，课程图片，综合评分，内容实用，简洁易懂，逻辑清晰
+ <font color=#3eaf7c>课程章节表</font>：<font color=#DD1144>章节ID</font>,课程ID(<font color=#1E90FF>存储空间小，和课程表关联方便</font>)，章节名称，章节说明，章节编号
+ <font color=#3eaf7c>课程小节表</font>：<font color=#DD1144>小节ID</font>，课程ID，章节ID，小节名称，小节视频url，视频格式，小节时长，小节编号
+ <font color=#3eaf7c>课程方向表</font>：<font color=#DD1144>课程方向ID</font>，课程方向名称，添加时间
+ <font color=#3eaf7c>课程分类表</font>：<font color=#DD1144>课程分类ID</font>，分类名称，添加时间
+ <font color=#3eaf7c>课程难度表</font>：<font color=#DD1144>课程难度ID</font>，课程难度,添加时间
+ <font color=#3eaf7c>用户表</font>：<font color=#DD1144>用户ID</font>，用户昵称(<font color=#1E90FF>添加唯一索引</font>)，密码，性别，省，市，职位，说明，经验，积分，关注人数，粉丝人数，讲师标识
+ <font color=#3eaf7c>问答评论表</font>：<font color=#DD1144>评论ID</font>，父评论ID，课程ID，章节ID，小节ID，评论标题，用户ID，内容，类型，浏览量，发布时间
+ <font color=#3eaf7c>笔记表</font>：<font color=#DD1144>笔记ID</font>，课程ID，章节ID，小节ID，用户昵称，笔记内容，发布时间
+ <font color=#3eaf7c>评价表</font>：<font color=#DD1144>评价ID</font>，用户ID，课程ID，内容ID，综合评分，内容实用，简洁易懂，逻辑清晰，发布时间
+ <font color=#3eaf7c>用户选课表</font>：<font color=#DD1144>用户选课ID</font>，用户ID,课程ID，选课时间，累积听课时长

## 数据类型
### 1. 整数类型
### 2. 实数类型
### 3. 时间类型
### 4. 字符串类型

## 选择类型

## 对象命名
