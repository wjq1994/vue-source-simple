export function createTextNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}
export function createElement(vm, tag, data = {}, ...children) {
    let key = data.key;
    if (key) {
        delete data.key;
    }
    return vnode(vm, tag, data, key, children);
}
function vnode(vm, tag, data, key, children, text) {
    return {
        vm,
        tag,
        data,
        key,
        children,
        text
    }
}