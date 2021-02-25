// 导出vue构造函数

import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './render';
import { stateMixin } from './state';

function Vue(options) {
    this._init(options);
}
initMixin(Vue); // 给原型上新增_init方法
renderMixin(Vue); // _render
lifecycleMixin(Vue); // _update
stateMixin(Vue);
export default Vue;