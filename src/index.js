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

export default Vue;