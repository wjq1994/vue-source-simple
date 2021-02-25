import { pushTarget, popTarget } from './dep';
import { queueWatcher } from './scheduler'

let id = 0;
class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.user = !! options.user
        this.exprOrFn = exprOrFn;
        if(typeof exprOrFn === 'function'){
            this.getter = exprOrFn; 
        }else{
            this.getter = function (){ // 将表达式转换成函数
                let path = exprOrFn.split('.');
                let obj = vm;
                for(let i = 0; i < path.length;i++){
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
        this.value = this.get(); // 将初始值记录到value属性上
    }
    /**
     * 每一个属性应该有一个依赖
     */
    get() {
        // 依赖注入
        pushTarget(this);
        // 下面这个方法，会执行defineReactive里属性的get方法
        // 在get方法里，需要对属性完成依赖注入
        const value = this.getter.call(this.vm); // 执行函数 （依赖收集）
        // 依赖删除
        popTarget();
        return value;

    }
    /**
     * 异步更新操作
     */
    update() {
        queueWatcher(this);
    }
    run() {
        console.log("异步操作");
        let value = this.get();    // 获取新值
        let oldValue = this.value; // 获取老值
        this.value = value;
        if(this.user){ // 如果是用户watcher 则调用用户传入的cb
            this.cb.call(this.vm,value,oldValue)
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
}

export default Watcher;