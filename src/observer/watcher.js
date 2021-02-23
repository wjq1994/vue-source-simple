import { pushTarget, popTarget } from './dep'
let id = 0;
class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        if (typeof exprOrFn == 'function') {
            this.getter = exprOrFn;
        }
        this.cb = cb;
        this.options = options;
        this.id = id++;
        // 存放依赖
        this.deps = [];
        this.depsId = new Set();
        this.get();
    }
    /**
     * 每一个属性应该有一个依赖
     */
    get() {
        // 依赖注入
        pushTarget(this);
        // 下面这个方法，会执行defineReactive里属性的get方法
        // 在get方法里，需要对属性完成依赖注入
        this.getter();
        // 依赖删除
        popTarget();
    }
    /**
     * 更新操作
     */
    update() {
        this.get();
    }
    addDep(dep) {
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.depsId.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
    }
}

export default Watcher;