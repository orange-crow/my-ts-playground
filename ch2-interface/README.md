# 接口（Interface）和类型别名（type）

## 目标

实现 Tool 接口和 ToolManager 的 register 与 call 基本功能，保证类型安全并能异步执行工具。


## 代码

代码实现见 src/tools.ts, 测试Demo代码见 src/index.ts;

同时在 tsconfig.json 中做出如下修改:

```
// "verbatimModuleSyntax": true,
```

## 执行

```bash
npx ts-node src/index.ts
```
