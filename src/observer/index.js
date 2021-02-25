import { isObject } from "../utils/index";
import { arrayMethods } from './array';
import Dep from './dep';

/**
 * 1. 如果是数据是对象会不停的递归劫持
 * 2. 如果是数组，数组没有监控索引的变化，只有监控7种方法的变化，以及数组中的数组及对象的递归劫持
 * 
 * 3. 数组的依赖收集
 */
class Observer { // 观测值
    constructor(value) {
        this.dep = new Dep();
        Object.defineProperty(value, "__ob__", {
            value: this,
            enumerable: false //不可枚举
        });
        // value.__ob__ = this; 存在会造成死循环，变成不可枚举
        // 数组劫持
        if (Array.isArray(value)) {
            // 对数组原来的方法进行改写、切片编程，高阶函数
            value.__proto__ = arrayMethods;
            // 如果数组中的数据是对象类型，需要监控对象的变化
            // 数组没有监控索引的变化
            this.observeArray(value);
        } else {
            this.walk(value); // 对象劫持
        }
    }
    /**
     * 对数组中的数组或对象继续劫持
     * 套娃劫持效率低下
     * @param {*} value 
     */
    observeArray(value) {
        for (let i = 0; i < value.length; i++) {
            observe(value[i]);
        }
    }
    walk(data) { // 让对象上的所有属性依次进行观测
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = data[key];
            defineReactive(data, key, value);
        }
    }
}

// 数组里的数组依赖收集
function dependArray(value) {
    for (let index = 0; index < value.length; index++) {
        const current = value[index]; // current是数组里的数组
        current.__ob__ && current.__ob__.dep.depend();

        if (Array.isArray(current)) {
            dependArray(current);
        }
    }
}

// vue2 会对对象进行遍历 将每个属性 用defineProperty 重新定义性能差
// 数据劫持之后，需要对属性进行监听
function defineReactive(data, key, value) {
    let childOb = observe(value);
    let dep = new Dep();
    Object.defineProperty(data, key, {
        get() {
            console.log("------get");
            if(Dep.target){ // 如果取值时有watcher
                dep.depend(); // 让watcher保存dep，并且让dep 保存watcher
                if (childOb) { // 
                    childOb.dep.depend();

                    if (Array.isArray(value)) {
                        dependArray(value);
                    }
                }
            }
            return value
        },
        set(newValue) {
            console.log("------set");
            if (newValue == value) return;
            observe(newValue);
            value = newValue;
            // 通知依赖更改
            dep.notify();
        }
    })
}
export function observe(data) {
    if (!isObject(data)) {
        return;
    }
    if (data.__ob__) {
        return data.__ob__;
    }
    return new Observer(data);
}