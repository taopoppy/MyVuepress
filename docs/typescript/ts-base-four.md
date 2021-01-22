# TS 简易爬虫

## 搭建简易环境
首先新建一个文件夹，在里面执行命令：
```shell
npm init -y // 生成package.json
tsc --init  // 生成tsconfig.json
```

接着下载两个重要的包：<font color=#1E90FF>ts-node</font>和<font color=#1E90FF>typescript</font>
```shell
npm i -D ts-node typescript
```
之所以将两个包打包进入开发工具当中，因为最终打包后还是`js`文件，`ts`作为类型检查工具实际上不会打包进入最终代码当中。然后我们修改一下`package.json`中的启动命令：
```javascript
"script": {
	"dev": "ts-node ./src/crowller.ts"
}
```

## 编写爬虫

### 1. 下载superagent
```shell
npm install superagent --save
npm install @types/superagent -D
```
+ <font color=#1E90FF>首先superagent是一个可以帮助我们在node当中发送ajax请求的工具</font>
+ <font color=#DD1144>ts文件直接引入superagent这种js库是不支持的，需要中间通过.d.ts这种翻译文件来识别js文件</font>
+ <font color=#DD1144>所以我们下载@types/superagent，这个翻译文件也只在开发环境当中使用，因为最终打包都是js文件，其次，怎么知道这个文件，可以在网上查，或者在开发时ts文件中引入包的时候会飘红，鼠标移上去就会有提示</font>


### 2. 下载cheerio
```shell
npm install cheerio --save
npm install @types/cheerio -D
```
+ <font color=#1E90FF>cheerio这个工具是帮助我们来分析爬虫内容的工具，通过类似于jquery的方式去分析</font>


### 3. 爬虫代码

```typescript
// crowller.ts
import fs from 'fs';
import path from 'path';
import superagent from 'superagent';
import DellAnalyzer from './dellAnalyzer';

export interface Analyzer {
  analyze: (html: string, filePath: string) => string;
}

/* 爬虫类 */
class Crowller {
  private filePath = path.resolve(__dirname, '../data/course.json');

	// 获取html内容的方法
  private async getRawHtml() {
    const result = await superagent.get(this.url);
    return result.text;
  }

	// 写文件内容的方法
  private writeFile(content: string) {
    fs.writeFileSync(this.filePath, content);
  }

	// 爬虫分析内容的方法
  private async initSpiderProcess() {
    const html = await this.getRawHtml();
    const fileContent = this.analyzer.analyze(html, this.filePath);
    this.writeFile(fileContent);
  }

	// 构造方法
  constructor(private url: string, private analyzer: Analyzer) {
    this.initSpiderProcess();
  }
}

const secret = 'secretKey';
const url = `http://www.dell-lee.com/typescript/demo.html?secret=${secret}`;

const analyzer = DellAnalyzer.getInstance();
new Crowller(url, analyzer);
```
```typescript
// dellAnalyzer.ts
import fs from 'fs';
import cheerio from 'cheerio';
import { Analyzer } from './crowller';

// 课程接口
interface Course {
  title: string;
  count: number;
}

// 课程结果接口
interface CourseResult {
  time: number;
  data: Course[];
}

// 内容接口
interface Content {
  [propName: number]: Course[];
}

export default class DellAnalyzer implements Analyzer {
	// 单例
	private static instance: DellAnalyzer;

	// 获取单例的方法
  static getInstance() {
    if (!DellAnalyzer.instance) {
      DellAnalyzer.instance = new DellAnalyzer();
    }
    return DellAnalyzer.instance;
  }

	// 获取课程信息
  private getCourseInfo(html: string) {
    const $ = cheerio.load(html);
    const courseItems = $('.course-item'); // 找到所有class为course-item的DOM节点
    const courseInfos: Course[] = [];
    courseItems.map((index, element) => {
      const descs = $(element).find('.course-desc'); // 找到该节点下的所有class为course-desc的DOM节点
      const title = descs.eq(0).text();
      const count = parseInt(descs.eq(1).text().split('：')[1],10);
      courseInfos.push({ title, count });
    });
    return {
      time: new Date().getTime(),
      data: courseInfos
    };
  }

  private generateJsonContent(courseInfo: CourseResult, filePath: string) {
    let fileContent: Content = {};
    if (fs.existsSync(filePath)) {
      fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    fileContent[courseInfo.time] = courseInfo.data;
    return fileContent;
  }

  public analyze(html: string, filePath: string) {
    const courseInfo = this.getCourseInfo(html);
    const fileContent = this.generateJsonContent(courseInfo, filePath);
    return JSON.stringify(fileContent);
  }

  private constructor() {}
}
```

## 编译过程
我们可以在`package.json`文件添加编译命令：
```javascript
"script": {
	...
	"build": "tsc"
}
```
这样执行`npm run build`的时候，就会对所有的`.ts`文件进行编译，编译的过程是按照我们的配置文件进行的，包括编译的文件路径等等，都在`tsconfig.json`当中进行配置，修改编译后的文件路径，可以修改其中的`outDir`:
```javascript
"outDir":"./build"
```
这样的话，所有编译的文件都进入到了根目录下的`build`目录下。

所以我们可以结合`nodemon`和`tsc`创建一个比较合理的开发热更新，首先在`package.json`当中创建这样两个命令：
```javascript
"script":{
	"build": "tsc -w",
	"start": "nodemon node ./build/crowller.js"
}
```
+ <font color=#DD1144>其中tsc -w 表示ts文件更新就会去立即编译成新的js文件</font>
+ <font color=#DD1144>nodemon是帮我们在js文件更新后立即去执行js文件内容</font>

所以我们使用上面两个命令后，启动项目的时候先使用`npm run build`编译一次代码，并且监控`ts`文件，然后再启动`npm run start`的命令，这样`ts`文件一更新，然后`tsc`就立即将其编译成为新的`js`文件，`js`文件一更新，`nodemon`就立刻重新执行`js`文件。

当然我们还可以更近一步，使用<font color=#9400D3>concurrently</font>工具同时执行多个命令:
```javascript
"script":{
	"dev:build": "tsc -w",
	"dev:start": "nodemon node ./build/crowller.js",
	"dev": "concurrently npm:dev:*"
}
```
然后直接运行：`npm run dev`就相当于同时执行了`npm run build`和`npm run start`