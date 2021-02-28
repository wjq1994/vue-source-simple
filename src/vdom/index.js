import { isObject, isReservedTag } from '../utils/index'

export function createTextNode(vm, text) {
    return vnode(undefined, undefined, undefined, undefined, text)
}

/**
 * * _c('div',{id:"app"},_c('my-component',undefined))
 * 先执行_c('my-component',undefined)，再执行 _c('div',{id:"app"},_c('my-component',undefined))
 * @param {*} vm 
 * @param {*} tag 
 * @param {*} data 
 * @param  {...any} children 
 */
export function createElement(vm, tag, data = {}, ...children) {
    let key = data.key;
    if (key) {
        delete data.key;
    }
    if (typeof tag === 'string') {
        if (isReservedTag(tag)) {
            return vnode(tag, data, key, children, undefined);
        } else {
            // 如果是自定义组件需要拿到组件的定义,通过组件的定义创造虚拟节点
            let Ctor = vm.$options.components[tag];
            return createComponent(vm, tag, data, key, children, Ctor)
        }
    }
}
function createComponent(vm, tag, data, key, children, Ctor) {
    // 获取父类构造函数t 
    const baseCtor = vm.$options._base; // Vue
    if (isObject(Ctor)) {
        Ctor = baseCtor.extend(Ctor); // Vue.extend();
    }
    data.hook = {
        init(vnode) {
            let child = vnode.componentInstance = new Ctor({});
            child.$mount(); // 组件的挂载 vm.$mount vm.$el = el;
        }
    }

    return vnode(`vue-component-${Ctor.cid}-${tag}`, data, key, undefined, { Ctor, children });
}
function vnode(tag, data, key, children, text, componentOptions) {
    return { tag, data, key, children, text, componentOptions }
}