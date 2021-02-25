import {isFunction, isObject} from "./utils/index";
import {observe} from "./observer/index";
import Watcher from "./observer/watcher"

export function stateMixin(Vue) {
    Vue.prototype.$watch = function(exprOrFn, cb, options = {}) {
        options.user = true; // 标记为用户watcher
        // 核心就是创建个watcher
        const watcher = new Watcher(this, exprOrFn, cb, options);
        if(options.immediate){
            cb.call(vm,watcher.value)
        }
    }
}

export function initState(vm){
    const opts = vm.$options;
    if(opts.props){
        initProps(vm);
    }
    if(opts.methods){
        initMethod(vm);
    }
    if(opts.data){
        // 初始化data
        initData(vm);
    }
    if(opts.computed){
        initComputed(vm);
    }
    if(opts.watch){
        initWatch(vm, opts.watch);
    }
}
function initProps(){}
function initMethod(){}
function proxy(vm,source,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key];
        },
        set(newValue){
            vm[source][key] = newValue;
        }
    });
}
function initData(vm){
    // 初始化数据，进行数据劫持 Object.defineProperty
    let data = vm.$options.data;
    // data 有可能是函数 用vm._data进行关联
    data = vm._data = isFunction(data) ? data.call(vm) : data;
    // 用户取 vm.xxx => vm._data.xxx
    for(let key in data){ // 将_data上的属性全部代理给vm实例
        proxy(vm,'_data',key)
    }
    observe(data);
}
function initComputed(){}
function initWatch(vm, watch){
    Object.keys(watch).forEach((key) => {
        const handler = watch[key];
        // 如果结果值是数组循环创建watcher
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm,key,handler[i]);
            }
        }else{
            createWatcher(vm,key,handler)
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
function createWatcher(vm,exprOrFn,handler,options){
    // 如果是对象则提取函数 和配置
    if(isObject(handler)){
        options = handler;
        handler = handler.handler;
    }
    // 如果是字符串就是实例上的函数
    if(typeof handler == 'string'){
        handler = vm[handler];
    }
    return vm.$watch(exprOrFn,handler,options);
}