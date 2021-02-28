import {mergeOptions} from '../utils/index.js'
export function initGlobalAPI(Vue){
    Vue.options = {};

    Vue.mixin = function (options) {
        // 将属性合并到Vue.options上
        this.options = mergeOptions(this.options,options);
        return this;
    }

    // _base 就是Vue的构造函数
    Vue.options._base = Vue;
    // components 组件
    Vue.options.components = {};
    
    initExtend(Vue);

    // 注册API方法
    initAssetRegisters(Vue);
}

export function initAssetRegisters(Vue) {
    Vue.component = function (id, definition) {
        definition.name = definition.name || id;
        definition = this.options._base.extend(definition);
        this.options['components'][id] = definition;
    }
}

export function initExtend(Vue) {
    let cid = 0;
    Vue.extend = function (extendOptions) {
        const Super = this;
        const Sub = function VueComponent(options) {
            this._init(options)
        }
        Sub.cid = cid++;
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;
        Sub.options = mergeOptions(
            Super.options,
            extendOptions
        );
        return Sub
    }
}