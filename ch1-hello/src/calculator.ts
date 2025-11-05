function calculate(a: number, b: number, op: string): number {
    // TODO: 根据 op 不同执行 + - * / 运算
    if (op === "+") {
        return a + b
    }
    else if (op === "-") {
        return a - b
    }
    else if (op === "*") {
        return a * b
    }
    else if (op === "/") {
        return a / b
    }
    else {
        throw new Error("Invalid operator!")
    }
  }

console.log(calculate(3, 2, "+")) // 输出 5
console.log(calculate(3, 2, "*")) // 输出 6

// 改进：用「字面量联合类型」让 op 只能是 +, -, *, /
function calculate2(a: number, b: number, op: "+" | "-" | "*" | "/"): number {
    if (op === "+") return a + b
    if (op === "-") return a - b
    if (op === "*") return a * b
    if (op === "/") return a / b
    throw new Error("Invalid operation!")
}

console.log(calculate2(3, 2, "%")) 
// TypeScript 会在你运行前就报错：Argument of type '"%"' is not assignable to parameter of type '"+" | "-" | "*" | "/"'.
// 这就是类型系统的威力——错误在运行前就被发现 💪