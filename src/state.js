import {isFunction} from "./utils";
import {observe} from "./observer/index";

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
        initWatch(vm);
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
function initWatch(){}