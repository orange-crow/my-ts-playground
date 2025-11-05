// 1) 定义 Tool 接口：
// - 每个 Tool 有 name 字段
// - 有一个 execute 方法，接受一个可选的 input: unknown，并返回 Promise<unknown>

export interface Tool {
    name: string
    execute: (input?: unknown) => Promise<unknown>
}

// 2) ToolManager 类：管理已注册的 tools
export class ToolManager {
    // private tools: Record<string, Tool> = {}
    // 实现 register(tool: Tool): void
    // 要求：
    // - 如果同名工具已存在，应抛出 Error（避免覆盖）
    // - 否则把 tool 存入 this.tools
    // register(tool: Tool): void {
    //     if (this.tools[tool.name]) throw new Error(`Tool ${tool.name} already registered!`)
    //     this.tools[tool.name] = tool
    // }

    // 实现 async call(name: string, input?: unknown): Promise<unknown>
    // 要求：
    // - 如果找不到 name，抛出 Error
    // - 调用对应 tool.execute(input) 并返回其结果
    // async call(name: string, input?: unknown): Promise<unknown> {
    //     if (!this.tools[name]) throw new Error(`Tool ${name} not found!`)
    //     return this.tools[name].execute(input)
    // }


    // Map 更适合运行时动态注册/删除工具（因为对象键是字符串固定的）。
    private tools = new Map<string, Tool>()
    register(tool: Tool): void {
        if (this.tools.has(tool.name)) throw new Error(`Tool ${tool.name} already registered!`)
        this.tools.set(tool.name, tool)
    }

    async call(name: string, input?: unknown): Promise<unknown> {
        const tool = this.tools.get(name)
        if (!tool) throw new Error(`Tool ${name} not found!`)
        return tool.execute(input)
    }
}
