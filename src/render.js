import {createTextNode,createElement} from './vdom/index'

export function renderMixin(Vue){
    Vue.prototype._v = function (text) { // 创建文本
        return createTextNode(this, text);
    }
    Vue.prototype._c = function () { // 创建元素
        return createElement(this, ...arguments);
    }
    Vue.prototype._s = function (val) {
        return val == null? '' : (typeof val === 'object'?JSON.stringify(val):val);
    }
    Vue.prototype._render = function () {
        const vm = this;
        let render = vm.$options.render; // 解析出来的render方法

        let vnode = render.call(vm);

        return vnode;
    }
}