# 第一次写TypeScript

## 1. 准备 TypeScript 环境

###  1️⃣  初始化 Node.js 项目
```bash
npm init -y
```

### 2️⃣  安装 TypeScript + ts-node（方便直接运行 .ts 文件）

```bash
npm install --save-dev typescript ts-node @types/node
```
执行完后会安装 node_modules.

### 3️⃣ 初始化 TypeScript 配置文件

```bash
npx tsc --init
```

运行完后，你会在文件夹里看到一个新文件：
📄 tsconfig.json —— TypeScript 的配置文件。

打开它，把里面这两行修改为

```json
"target": "es2020",
"strict": true,
```

这能让 TypeScript 编译得更现代、更严格（这样能帮我们写出更安全的代码）。



## 2. 写你的第一个 TypeScript 文件

在项目根目录下新建文件夹 src 和文件 index.ts：

```
ch1-hellow/
  ├── src/
  │    └── index.ts
  ├── package.json
  ├── tsconfig.json
```

然后在 src/index.ts 里输入下面这段代码

```ts
function hello(name: string) {
    console.log(`Hello, ${name}!`)
}

hello('TypeScript')
```

运行它：

```
npx ts-node src/index.ts

```
如果一切正常，你应该在终端看到：

```bash
Hello, TypeScript!
```


## 3. TypeScript 的基本类型与类型推断
TypeScript 的核心就是「给 JavaScript 加上类型」。
### 3.1 最常用的几种类型

| 类型                   | 示例                                             | 说明           |
| -------------------- | ---------------------------------------------- | ------------ |
| `number`             | `let x: number = 3.14`                         | 所有数字（整数/浮点）  |
| `string`             | `let s: string = "hello"`                      | 文本字符串        |
| `boolean`            | `let b: boolean = true`                        | 布尔值          |
| `any`                | `let v: any = 42`                              | 关闭类型检查（慎用）   |
| `unknown`            | `let u: unknown = "?"`                         | 安全的“未知类型”    |
| `array`              | `let arr: number[] = [1,2,3]`                  | 数组类型         |
| `object`             | `let obj: {name: string, age: number}`         | 对象类型         |
| `null` / `undefined` | 允许为空值                                          | 常见于可选属性或默认参数 |
| `void`               | `function log(): void {}`                      | 没有返回值的函数     |
| `never`              | `function fail(): never { throw new Error() }` | 永远不会返回（异常）   |

### 3.2 类型推断

TypeScript 能自动推断类型，例如：

```ts
let message = "Hello"
message = 42   // ❌ 错误，因为推断 message 是 string
```

你不用每次都写 : string，编译器会帮你推断。但当你想要明确约束时，显式类型标注是更好的做法。


