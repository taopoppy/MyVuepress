# Node + React开发一个DApp

我们作为一个前端工程师怎么切入区块链这个行业，我们首先要做两个事情：
+ <font color=#1E90FF>使用Nodejs开发迷你区块链</font>：将区块链常用的名词术语使用`node`来实现一下，因为区块链是一个比较系统的体系，所以我们需要先了解整个原理，包括挖矿，转账，非对称加密等等
+ <font color=#1E90FF>基于以太坊的开发平台开发一个DApp</font>

+ 我们使用到的技术栈是`Nodejs`
+ 在以太坊中的智能合约我们使用`Solidity`语言来开发，整个项目的后端和数据库都运行在区块链之上
+ 前端使用`React.js`来开发，但是前端怎么和区块链交互呢，我们使用`web3.js`，这个是一个官方的`sdk`,在浏览器可以直接访问到区块链的内容
+ 在以太坊存一些文字或者代码都是没有问题的，但是存文件，比如视频或者音频，还有图片这种大的东西，我们就将这些大的文件存在`IPFS`这个<font color=#1E90FF>文件网络</font>之上，然后将这些文件的哈希值存在于以太坊之上


**参考资料**

1. [https://github.com/shengxinjing/iblockchain](https://github.com/shengxinjing/iblockchain)
2. [白皮书](https://bitcoin.org/bitcoin.pdf)
3. [区块链技术核心概念与原理讲解](https://www.imooc.com/learn/988)
4. [孔壹学院1](https://www.chaindesk.cn/)
5. [孔壹学院2](http://edu.kongyixueyuan.com/)