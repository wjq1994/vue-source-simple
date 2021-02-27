import { isFunction, isObject } from "./utils/index";
import { observe } from "./observer/index";
import Watcher from "./observer/watcher"
import Dep from "./observer/dep";

export function stateMixin(Vue) {
    Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
        options.user = true; // 标记为用户watcher
        // 核心就是创建个watcher
        const watcher = new Watcher(this, exprOrFn, cb, options);
        if (options.immediate) {
            cb.call(vm, watcher.value)
        }
    }
}

export function initState(vm) {
    const opts = vm.$options;
    if (opts.props) {
        initProps(vm);
    }
    if (opts.methods) {
        initMethod(vm);
    }
    if (opts.data) {
        // 初始化data
        initData(vm);
    }
    if (opts.computed) {
        initComputed(vm, opts.computed);
    }
    if (opts.watch) {
        initWatch(vm, opts.watch);
    }
}
function initProps() { }
function initMethod() { }
function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key];
        },
        set(newValue) {
            vm[source][key] = newValue;
        }
    });
}
function initData(vm) {
    // 初始化数据，进行数据劫持 Object.defineProperty
    let data = vm.$options.data;
    // data 有可能是函数 用vm._data进行关联
    data = vm._data = isFunction(data) ? data.call(vm) : data;
    // 用户取 vm.xxx => vm._data.xxx
    for (let key in data) { // 将_data上的属性全部代理给vm实例
        proxy(vm, '_data', key)
    }
    observe(data);
}
function initComputed(vm, computed) {
    // 存放计算属性的watcher
    const watchers = vm._computedWatchers = {};
    for (const key in computed) {
        const userDef = computed[key];
        // 获取get方法
        const getter = typeof userDef === 'function' ? userDef : userDef.get;
        // 创建计算属性watcher
        watchers[key] = new Watcher(vm, userDef, () => { }, { lazy: true });
        defineComputed(vm, key, userDef)
    }
}
function initWatch(vm, watch) {
    Object.keys(watch).forEach((key) => {
        const handler = watch[key];
        // 如果结果值是数组循环创建watcher
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i]);
            }
        } else {
            createWatcher(vm, key, handler)
        }
    });
}

/**
 * 
 * @param {*} vm 
 * @param {*} exprOrFn 
 * @param {*} handler 
 * @param {*} options 
 */
function createWatcher(vm, exprOrFn, handler, options) {
    // 如果是对象则提取函数 和配置
    if (isObject(handler)) {
        options = handler;
        handler = handler.handler;
    }
    // 如果是字符串就是实例上的函数
    if (typeof handler == 'string') {
        handler = vm[handler];
    }
    return vm.$watch(exprOrFn, handler, options);
}

/**
 * 
 * @param {*} target 
 * @param {*} key 
 * @param {*} userDef 
 */
function defineComputed(target, key, userDef) {
    let sharedPropertyDefinition = {};
    if (typeof userDef === 'function') {
        sharedPropertyDefinition.get = createComputedGetter(key)
    } else {
        sharedPropertyDefinition.get = createComputedGetter(userDef.get);
        sharedPropertyDefinition.set = userDef.set;
    }
    // 使用defineProperty定义
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

/**
 * 
 * @param {*} key 
 */
function createComputedGetter(key) {
    return function computedGetter() {
        console.log("computedGetter");
        const watcher = this._computedWatchers[key];
        if (watcher) {
            if (watcher.dirty) { // 如果dirty为true
                watcher.evaluate();// 计算出新值，并将dirty 更新为false
            }
            // 存在问题：执行computed属性时，会调用computed属性里用到的其他属性的get方法，此时其他属性收集到的也是computed watch，所以当其他属性set时，computed属性值不会变化。
            // 以下是解决方案
            if (Dep.target) {
                watcher.depend();
            }

            // 如果依赖的值不发生变化，则返回上次计算的结果
            return watcher.value
        }
    }
}