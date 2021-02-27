import Dep, { pushTarget, popTarget } from './dep';
import { queueWatcher } from './scheduler'

let id = 0;
/**
 * 系统里的Watcher会初始化执行一遍 -> 这个过程会带调用Render函数中用到的属性的get方法（即会执行defineReactive里属性的get方法，属性完成对系统watch的依赖收集）
 * 用户定义的Watcher 只是返回属性的值
 * computed watcher
 */
class Watcher {
    /**
     * 
     * @param {*} vm 
     * @param {*} exprOrFn 
     * @param {*} cb 
     * @param {*} options 
     */
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.user = !!options.user
        this.exprOrFn = exprOrFn;
        // 判断是compute属性的标识
        this.lazy = !!options.lazy;
        this.dirty = this.lazy; // 默认lazy dirty都为true
        if (typeof exprOrFn === 'function') {
            this.getter = exprOrFn;
        } else {
            // 用户自定义watch走的getter
            this.getter = function () { // 将表达式转换成函数
                let path = exprOrFn.split('.');
                let obj = vm;
                for (let i = 0; i < path.length; i++) {
                    obj = obj[path[i]];
                }
                return obj;
            }
        }
        this.cb = cb;
        this.options = options;
        this.id = id++;
        // 存放依赖
        this.deps = [];
        this.depsId = new Set();
        this.value = this.lazy ? undefined : this.get(); // 调用get方法 会让渲染watcher执行
    }
    get() {
        // 依赖注入
        pushTarget(this);
        const value = this.getter.call(this.vm); // 执行函数 （依赖收集）
        // 依赖删除
        popTarget();
        return value;

    }
    /**
     * 数据劫持有变化时，执行跟新
     * 异步更新操作
     */
    update() {
        if (this.lazy) {
            this.dirty = true;
        } else {
            queueWatcher(this);
        }
    }
    run() {
        console.log("异步操作");
        let value = this.get();    // 获取新值
        let oldValue = this.value; // 获取老值
        this.value = value;
        if (this.user) { // 如果是用户watcher 则调用用户传入的cb
            this.cb.call(this.vm, value, oldValue)
        }
    }
    addDep(dep) {
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.depsId.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
    }
    evaluate() {
        this.value = this.get();
        this.dirty = false;
    }
    depend() {
        this.deps.forEach((dep) => {
            dep.depend();
        });
    }
}

export default Watcher;