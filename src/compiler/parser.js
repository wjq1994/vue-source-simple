const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  // 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // 用来获取的标签名的match后的索引为1
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >

let currentParent;
// 用栈的方式处理节点
let stack = [];
const ELEMENT_TYPE = 1;
const TEXT_TYPE = 3;

// 解析整个传入html
export function parseHTML(html) {
    let root = null;
    /**
     * 生成ast语法树，语法树就是用对象描述js语法
     * @param {*} tagName 
     * @param {*} attrs 
     */
    function createASTElement(tagName, attrs) {
        return {
            tag: tagName,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }
    function start(tagName, attrs) {
        let element = createASTElement(tagName, attrs);
        if (!root) {
            root = element;
        }
        currentParent = element;
        stack.push(element);
    }
    function end(tagName) {
        let element = stack.pop();
        currentParent = stack[stack.length - 1];
        if (currentParent) {
            element.parent = currentParent;
            currentParent.children.push(element);
        }
    }
    function chars(text) {
        text = text.replace(/\s/g, '');
        if (text) {
            currentParent.children.push({
                type: TEXT_TYPE,
                text
            })
        }
    }
    // 循环html字符串
    while (html) {
        // 如果此时首字符串是<，说明是标签
        let textEnd = html.indexOf('<');
        if (textEnd == 0) {
            const startTagMatch = parseStartTag();
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }
            const endTagMatch = html.match(endTag);
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }
        }
        let text;
        if (textEnd >= 0) {
            text = html.substring(0, textEnd);
        }
        if (text) {
            advance(text.length);
            chars(text);
        }
    }
    return root;
    function advance(n) {
        html = html.substring(n);
    }
    function parseStartTag() {
        // 捕获标签名称
        const start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length);
            let attr, end;
            // 匹配标签 结束 >
            // 获取标签属性和属性值
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push({ name: attr[1], value: attr[3] });
            }
            if (end) {
                advance(end[0].length);
                return match
            }
        }
    }
}