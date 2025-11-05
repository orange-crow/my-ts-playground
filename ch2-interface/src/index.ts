import {ToolManager} from './tool'
import type {Tool} from './tool'

const toolManager = new ToolManager()

// 一个简单的示例工具
const echoTool: Tool = {
    name: 'echo',
    async execute (input?: unknown) {
        return `Echo: ${String(input)}`
    }
}

// 注册并调用（在你实现 register 与 call 后，这段代码应该能运行）

async function main() {
    toolManager.register(echoTool)
    const result = await toolManager.call('echo', 'Hello TypeScript!')
    console.log(result)
}

main()
