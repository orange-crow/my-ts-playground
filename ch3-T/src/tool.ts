// 1) 泛型 Tool 接口：I 输入类型, O 输出类型
export interface Tool<I = unknown, O = unknown> {
    name: string
    execute(input?: I): Promise<O>
  }
//用 Promise 包装超时机制，如果超过指定时间未完成，抛出超时错误
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        // 1. 设置超时定时器
        const timer = setTimeout(() => reject(new Error('Timeout')), ms) // => 是 箭头函数（Arrow Function） 的语法，在 JavaScript/TypeScript 中用来定义函数
        // 2. 监听原始 Promise 的结果
        promise.then(res => { clearTimeout(timer); resolve(res) }) // 取消超时；传递成功结果
               .catch(err => { clearTimeout(timer); reject(err) }) // 取消超时；传递错误
    })
}


// 2) ToolManager：使用 Map 存储工具
export class ToolManager {
    private tools = new Map<string, Tool<any, any>>()

    // 实现 register：当传入 Tool<I,O> 时保存到 this.tools
    register<I, O>(tool: Tool<I, O>): void {
        // 如果已存在同名工具，抛错；否则保存
        const existingTool = this.tools.get(tool.name)
        if (existingTool) throw new Error(`Tool ${tool.name} already registered!`)
        this.tools.set(tool.name, tool)
    }

    // 实现 call：调用时，调用者可以提供泛型 <I,O> 来表明期望的输入输出
    // 使用示例： const res = await manager.call<number, string>('sum', 123)
    async call<I, O>(name: string, input?: I, options?: {timeout?: number, retries?: number}): Promise<O> {
        // 查找 tool，如果不存在抛错；否则调用 tool.execute(input) 并返回结果
        // 注意：this.tools 是 Tool<any, any>，你可能需要类型断言来调用 execute 并返回 O
        const tool = this.tools.get(name)
        if (!tool) throw new Error(`Tool ${name} not found!`)
        
        // // 增加超时机制
        // const resultPromise = tool.execute(input) as Promise<O>
        // if (options?.timeout) return withTimeout(resultPromise, options.timeout)
        // else return resultPromise

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
    }

    // 实现 unregister(name: string): boolean
    // 用 this.tools.has(name) 先判断是否存在，或者直接用 this.tools.delete(name)（它返回 true | false）。
    unregister(name: string): boolean {return this.tools.delete(name) ? true : false}

    // 实现 list(): string[]
    list(): string[] {return Array.from(this.tools.keys())}
}
