import { initState } from './state';
import { compileToFunctions } from './compiler/index';
import { mountComponent } from './lifecycle';
import { mergeOptions } from "./utils/index";
import { callHook } from "./lifecycle"

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        // 类上的options 实例中的options 合并
        vm.$options = mergeOptions(vm.constructor.options, options);
        // 初始化状态
        callHook(vm, 'beforeCreate');
        // 初始化状态，对数据进行初始化
        initState(vm); // 数据劫持
        callHook(vm, 'created');
        // 页面挂载
        if (vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    }
    // 子组件也会重新走这个逻辑
    Vue.prototype.$mount = function (el) {
        const vm = this;
        const options = vm.$options;
        el = document.querySelector(el);

        // TODO...
        // 如果没有render方法 
        if (!options.render) {
            let template = options.template;
            // 如果没有模板但是有el
            if (!template && el) {
                template = el.outerHTML;
            }

            const render = compileToFunctions(template);
            options.render = render;
        }
        
        mountComponent(vm, el);
    }
}