import { Tool, ToolManager } from './tool'

// 创建 ToolManager
const manager = new ToolManager()

// 示例工具 1：echo
const echoTool: Tool<string, string> = {
    name: 'echo',
    async execute(input?: string) {
        return `echo: ${String(input)}`
    }
}

// 示例工具 2：waitTool（模拟延迟，可测试超时/重试）
const waitTool: Tool<number, string> = {
    name: 'wait',
    async execute(input?: number) {
        const delay = input ?? 1000
        return new Promise<string>((resolve) => {
            setTimeout(() => resolve(`done after ${delay}ms`), delay)
        })
    }
}

// 主函数测试
async function main() {
    // 注册工具
    manager.register(echoTool)
    manager.register(waitTool)
    console.log('Registered tools:', manager.list()) // expect ['echo', 'wait']

    // 调用 echo
    console.log(await manager.call<string, string>('echo', 'hello')) // expect 'echo: hello'

    // 调用 waitTool，超时测试
    try {
        console.log(await manager.call<number, string>('wait', 2000, { timeout: 1000 }))
    } catch (err) {
        console.error('Timeout test:', (err as Error).message) // expect 'Timeout'
    }

    // 调用 waitTool，重试测试（第一次失败，第二次成功）
    const flakyTool: Tool<void, string> = {
        name: 'flaky',
        async execute() {
            if (Math.random() < 0.5) throw new Error('random fail')
            return 'success'
        }
    }
    manager.register(flakyTool)
    console.log(await manager.call<void, string>('flaky', undefined, { retries: 5 }))

    // 测试 unregister
    console.log('unregister echo:', manager.unregister('echo')) // expect true
    console.log('Registered tools after unregister:', manager.list())
}

main().catch(console.error)
