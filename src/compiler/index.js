import { parseHTML } from "./parser";
import { generate } from "./generate";

/**
 * 语法分析生成render函数
 * 模版引擎原理
 * new Function + with
 * @param {模版} template 
 */
export function compileToFunctions(template) {
    let root = parseHTML(template);
    let code = generate(root);
    let render = `with(this){return ${code}}`;
    let renderFn = new Function(render);
    return renderFn
}