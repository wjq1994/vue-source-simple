// 导出vue构造函数

import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './render';
import { stateMixin } from './state';
import { initGlobalAPI } from "./global-api/index"

function Vue(options) {
    this._init(options);
}

// 扩展原型
initMixin(Vue); // 给原型上新增_init方法
renderMixin(Vue); // _render
lifecycleMixin(Vue); // _update
stateMixin(Vue);

// 扩展类 Vue.extend Vue.component
initGlobalAPI(Vue);

// TODO... 测试diff算法
// import { compileToFunctions } from './compiler/index.js';
// import { patch, createElm } from './vdom/patch';
// // 1.创建第一个虚拟节点
// let vm1 = new Vue({ data: { name: 'zf' } });
// let render1 = compileToFunctions('<div><li key="C">C</li><li key="B">B</li><li key="A">A</li><li key="D">D</li></div>')
// let oldVnode = render1.call(vm1)
// // 2.创建第二个虚拟节点
// let vm2 = new Vue({ data: { name: 'jw' } });
// let render2 = compileToFunctions('<div><li key="B">B</li><li key="C">C</li><li key="D">D</li><li key="A">A</li></div>');
// let newVnode = render2.call(vm2);
// // 3.通过第一个虚拟节点做首次渲染
// let el = createElm(oldVnode)
// document.body.appendChild(el);
// setTimeout(() => {
//     // 4.调用patch方法进行对比操作
//     patch(oldVnode, newVnode);
// }, 4000);


export default Vue;