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

## 实用功能：增加超时/重试 与 unregister/list

- 目标：在运行时增强 call，支持超时控制、重试策略，并实现 unregister(name) 与 list()。
- 好处：马上能提升框架的鲁棒性和可运维性，不需要复杂的 TS 类型技巧。

### unregister(name)

在 ToolManager 上实现

```
unregister(name: string): boolean
```

要求：

- 如果找到并删除了对应工具，返回 true；
- 如果没有找到对应工具，返回 false（不要抛错）；
- 保持 this.tools 使用 Map（你之前已经用了 Map），用 Map 的 API 实现删除。

练习提示: 

- 用 this.tools.has(name) 先判断是否存在，或者直接用 this.tools.delete(name)（它返回 true | false）。
- 记得导出方法签名并在 src/index.ts 中写一个小测试来验证行为（注册一个工具，unregister 它，再 call 验证会抛错；以及对不存在的名字调用 unregister 返回 false）。

```ts
// src/tool.ts
    // 实现 unregister(name: string): boolean
    // 用 this.tools.has(name) 先判断是否存在，或者直接用 this.tools.delete(name)（它返回 true | false）。
    unregister(name: string): boolean {return this.tools.delete(name) ? true : false}
```

### list()

目标：
- 给 ToolManager 增加一个 list() 方法，返回当前已注册的工具名字数组（string[]）。
- 便于你在调试和运维中查看有哪些工具被注册。

提示: Map 自带 keys() 方法，可以把它转成数组。

```ts
// src/tool.ts
    // 实现 list(): string[]
    list(): string[] {return Array.from(this.tools.keys())}
```

测试示例（放到 src/index.ts 的 main 里）：

```ts
manager.register(echoTool)
console.log(manager.list()) // expect ['echo']
```

### 实现 超时机制

目标：
- 在 ToolManager 的 call 方法中增加可选配置：
- 超时：如果 tool.execute 超过指定时间未完成，抛出超时错误
- 重试：如果执行失败，可以自动重试指定次数

实现方式：
用 Promise 包装超时
```ts
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), ms)
        promise.then(res => { clearTimeout(timer); resolve(res) })
               .catch(err => { clearTimeout(timer); reject(err) })
    })
}
```

然后在 call 中：
```ts
const resultPromise = tool.execute(input) as Promise<O>
if (options?.timeout) return withTimeout(resultPromise, options.timeout)
return resultPromise
```

✅ 这样写才能真正“超时抛错”，并且保持 Promise 链正确。

- 如果执行超过 timeout 毫秒，Promise 会 reject 并抛出 'Timeout' 错误
- 没有超时限制时，行为和之前一致。
- 类型保持泛型化，调用时依然能获得输入输出类型检查

### 实现重试机制

- 如果调用失败（reject），自动重试指定次数
- 可在 options.retries 中设置
- 每次失败后，重新调用 tool.execute(input)，直到成功或次数用完

小提示：
- 用一个 for 循环控制重试次数
- 每次失败 catch 后判断是否还有剩余重试次数
- 如果用 withTimeout 包裹 tool.execute，每次重试也要重新包裹

```ts
        // 增加超时与重试机制
        const retries = options?.retries ?? 3
        const timeout = options?.timeout

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const resultPromise = tool.execute(input) as Promise<O>
                return timeout ? withTimeout(resultPromise, timeout) : resultPromise
            } catch (err) {
                if (attempt === retries - 1) throw err
                console.log(`Tool ${name} failed attempt ${attempt + 1}, retrying...`)
            }
        }
        throw new Error(`Tool ${name} failed after ${retries} attempts`)
```

✅ 特点：

- 每次重试都会重新执行 tool.execute
- 超时和重试组合起来工作
- 最终失败时抛出最后一次错误


### Promise
在 JavaScript/TypeScript 里，Promise 是一种对象，用来表示一个“可能还没完成，但将来会完成的异步操作”。

简单来说，它就是一个 异步任务的占位符，用来处理异步结果或者异步错误。

#### 为什么需要 Promise？
在 TypeScript 中需要 Promise 主要有以下几个重要原因：

##### 1. 类型安全的异步编程

Promise 为异步操作提供了类型安全保障：

```typescript
// 明确的类型注解
function fetchUser(id: number): Promise<User> {
  return fetch(`/api/users/${id}`).then(res => res.json());
}

// TypeScript 会检查返回类型
fetchUser(123).then((user: User) => {
  console.log(user.name); // 自动补全和类型检查
});
```

##### 2. 解决回调地狱问题

对比传统回调方式：

```typescript
// 回调地狱
getUser(userId, (user) => {
  getPosts(user.id, (posts) => {
    getComments(posts[0].id, (comments) => {
      // 嵌套越来越深...
    });
  });
});

// Promise 链式调用
getUser(userId)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => {
    // 扁平的结构
  });
```

##### 3. 更好的错误处理机制

```typescript
// 统一的错误处理
asyncOperation()
  .then(result => {
    // 处理成功结果
  })
  .catch(error => {
    // 统一处理所有错误
    // TypeScript 知道 error 的类型
  });

// 对比回调方式的错误处理需要每个回调都处理
```

##### 4. 与 async/await 完美配合

```typescript
// 使用 async/await 更直观
async function getUserData(userId: number) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchUserPosts(user.id);
    return { user, posts };
  } catch (error) {
    // TypeScript 可以推断 error 类型
    console.error('获取用户数据失败:', error);
  }
}
```

##### 5. 可组合的异步操作

```typescript
// 并行执行
const [user, posts] = await Promise.all([
  fetchUser(userId),
  fetchUserPosts(userId)
]);

// 竞速操作
const result = await Promise.race([
  fetchFromPrimaryAPI(),
  fetchFromBackupAPI()
]);
```

##### 6. 类型推断和自动完成

TypeScript 能够：
- 推断 Promise 的解析值类型
- 提供准确的自动完成
- 在编译时捕获类型错误

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(): Promise<User> {
  // ...
}

const userPromise = getUser();
// TypeScript 知道 userPromise 最终会解析为 User 类型
```


##### 7. 在我们写的 ToolManager 里

- tool.execute(input) 返回 Promise<O>
- 这是因为工具可能做异步操作（例如调用 API、读写文件、做计算）
- 我们用 await tool.execute(input) 来 等待异步结果
- 用 withTimeout 包装 Promise 可以设置超时
- 用 try/catch + 循环可以实现重试

换句话说，Promise 帮我们 安全地处理异步操作的成功和失败，而且可以组合超时、重试等高级逻辑。

##### 总结

Promise 在 TypeScript 中不仅是异步编程的工具，更是**类型安全的异步编程基石**。它让异步代码：
- ✅ 更易读、易维护
- ✅ 类型安全
- ✅ 错误处理更清晰
- ✅ 与现代 JavaScript 特性完美集成

这就是为什么 TypeScript 需要并且重视 Promise 的原因。

### 箭头函数定义

```ts
// 传统函数
promise.then(function(res) {
    clearTimeout(timer);
    resolve(res);
});

// 箭头函数（更简洁）
promise.then(res => {
    clearTimeout(timer);
    resolve(res);
});
```