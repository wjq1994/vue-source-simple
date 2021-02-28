import {patch} from './vdom/patch';
import Watcher from './observer/watcher';
import {
    nextTick
} from './utils/next-tick';

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this;
        // 生成真实dom 挂载到$el上
        vm.$el = patch(vm.$el, vnode);
    }
    Vue.prototype.$nextTick = function (cb) {
        nextTick(cb);
    }
}
export function mountComponent(vm, el) {
    vm.$el = el;
    let updateComponent = () => {
        // 将虚拟节点 渲染到页面上
        // 调用render函数，生成虚拟DOM
        // 用虚拟DOM，生成真实DOM
        vm._update(vm._render());
    }
    callHook(vm, 'beforeMount');
    // 实现响应式更新思路：观察者模式
    // 被观察者 data里属性
    // 这是渲染DOM的watcher
    new Watcher(vm, updateComponent, () => {}, true);
    callHook(vm, 'mounted');
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook];
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            handlers[i].call(vm);
        }
    }
}