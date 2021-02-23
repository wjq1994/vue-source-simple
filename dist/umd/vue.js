(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function isFunction(data) {
    return typeof data === 'function';
  }
  function isObject(data) {
    return _typeof(data) === 'object' && data !== null;
  }

  // 增加数组原型方法
  var oldArrayProtoMethods = Array.prototype;
  var arrayMethods = Object.create(oldArrayProtoMethods);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // 数组的这7种方法会刚改数据，所以要对其重写

  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayProtoMethods[method].apply(this, args);
      var ob = this.__ob__;
      var inserted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
      }

      if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测

      return result;
    };
  });

  var id = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id++;
      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        if (Dep.target) {
          Dep.target.addDep(this); // 让watcher,去存放dep
        }
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }]);

    return Dep;
  }();

  var stack = [];
  function pushTarget(watcher) {
    Dep.target = watcher;
    stack.push(watcher);
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  /**
   * 1. 如果是数据是对象会不停的递归劫持
   * 2. 如果是数组，数组没有监控索引的变化，只有监控7种方法的变化，以及数组中的数组及对象的递归劫持
   */

  var Observer = /*#__PURE__*/function () {
    // 观测值
    function Observer(value) {
      _classCallCheck(this, Observer);

      Object.defineProperty(value, "__ob__", {
        value: this,
        enumerable: false //不可枚举

      }); // value.__ob__ = this; 存在会造成死循环，变成不可枚举
      // 数组劫持

      if (Array.isArray(value)) {
        // 对数组原来的方法进行改写、切片编程，高阶函数
        value.__proto__ = arrayMethods; // 如果数组中的数据是对象类型，需要监控对象的变化
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


    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(value) {
        for (var i = 0; i < value.length; i++) {
          observe(value[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 让对象上的所有属性依次进行观测
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = data[key];
          defineReactive(data, key, value);
        }
      }
    }]);

    return Observer;
  }(); // vue2 会对对象进行遍历 将每个属性 用defineProperty 重新定义性能差
  // 数据劫持之后，需要对属性进行监听


  function defineReactive(data, key, value) {
    observe(value);
    var dep = new Dep();
    Object.defineProperty(data, key, {
      get: function get() {
        console.log("-----get");

        if (Dep.target) {
          // 如果取值时有watcher
          dep.depend(); // 让watcher保存dep，并且让dep 保存watcher
        }

        return value;
      },
      set: function set(newValue) {
        console.log("-----set", newValue);
        if (newValue == value) return;
        observe(newValue);
        value = newValue; // 通知依赖更改

        dep.notify();
      }
    });
  }

  function observe(data) {
    if (!isObject(data)) {
      return;
    }

    if (data.__ob__) {
      return;
    }

    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      // 初始化data
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  function initData(vm) {
    // 初始化数据，进行数据劫持 Object.defineProperty
    var data = vm.$options.data; // data 有可能是函数 用vm._data进行关联

    data = vm._data = isFunction(data) ? data.call(vm) : data; // 用户取 vm.xxx => vm._data.xxx

    for (var key in data) {
      // 将_data上的属性全部代理给vm实例
      proxy(vm, '_data', key);
    }

    observe(data);
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // 用来获取的标签名的match后的索引为1

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >

  var root;
  var currentParent; // 用栈的方式处理节点

  var stack$1 = [];
  var ELEMENT_TYPE = 1;
  var TEXT_TYPE = 3;
  /**
   * 生成ast语法树，语法树就是用对象描述js语法
   * @param {*} tagName 
   * @param {*} attrs 
   */

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: ELEMENT_TYPE,
      children: [],
      attrs: attrs,
      parent: null
    };
  }

  function start(tagName, attrs) {
    var element = createASTElement(tagName, attrs);

    if (!root) {
      root = element;
    }

    currentParent = element;
    stack$1.push(element);
  }

  function end(tagName) {
    var element = stack$1.pop();
    currentParent = stack$1[stack$1.length - 1];

    if (currentParent) {
      element.parent = currentParent;
      currentParent.children.push(element);
    }
  }

  function chars(text) {
    text = text.replace(/\s/g, '');

    if (text) {
      currentParent.children.push({
        type: TEXT_TYPE,
        text: text
      });
    }
  } // 解析整个传入html


  function parseHTML(html) {
    // 循环html字符串
    while (html) {
      // 如果此时首字符串是<，说明是标签
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0;

      if (textEnd >= 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }

      return root;
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      // 捕获标签名称
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);

        var attr, _end; // 匹配标签 结束 >
        // 获取标签属性和属性值


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3]
          });
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaa}}

  function gen(node) {
    if (node.type == 1) {
      return generate(node);
    } else {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      }

      var lastIndex = defaultTagRE.lastIndex = 0;
      var tokens = [];
      var match, index;

      while (match = defaultTagRE.exec(text)) {
        index = match.index;

        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }

        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }

      return "_v(".concat(tokens.join('+'), ")");
    }
  }

  function getChildren(el) {
    // 生成儿子节点
    var children = el.children;

    if (children) {
      return "".concat(children.map(function (c) {
        return gen(c);
      }).join(','));
    } else {
      return false;
    }
  }

  function genProps(attrs) {
    // 生成属性
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          //color:red;background:green
          var obj = {};
          attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
            obj[arguments[1]] = arguments[2];
          }); // attr.value.split(';').forEach(item=>{
          //     let [key,value] = item.split(':');
          //     obj[key] = value;
          // })

          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }
  /**
   * 将AST对象转换成Render函数
  <div style="color:red">hello {{name}} <span></span></div>
  render(){
     return _c('div',{style:{color:'red'}},_v('hello'+_s(name)),_c('span',undefined,''))
  }
   * 
   */

  /**
   * 
   * @param {*AST对象} el 
   */


  function generate(el) {
    var children = getChildren(el);
    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : 'undefined').concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  /**
   * 语法分析生成render函数
   * 模版引擎原理
   * new Function + with
   * @param {模版} template 
   */

  function compileToFunctions(template) {
    var root = parseHTML(template);
    var code = generate(root);
    var render = "with(this){return ".concat(code, "}");
    var renderFn = new Function(render);
    return renderFn;
  }

  // 用vnode 来生成真实dom 替换原来的dom元素
  function patch(oldVnode, vnode) {
    if (oldVnode.nodeType == 1) {
      var parentElm = oldVnode.parentNode; //找到父元素

      var elm = createElm(vnode); // 根据虚拟节点 创建元素

      parentElm.insertBefore(elm, oldVnode.nextSibling);
      parentElm.removeChild(oldVnode);
      return elm;
    }
  }

  function createElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        var children = vnode.children,
        text = vnode.text;
        vnode.vm;

    if (typeof tag === 'string') {
      // 元素
      vnode.el = document.createElement(tag); // 虚拟节点会有一个el属性 对应

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  var id$1 = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrFn = exprOrFn;

      if (typeof exprOrFn == 'function') {
        this.getter = exprOrFn;
      }

      this.cb = cb;
      this.options = options;
      this.id = id$1++; // 存放依赖

      this.deps = [];
      this.depsId = new Set();
      this.get();
    }
    /**
     * 每一个属性应该有一个依赖
     */


    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // 依赖注入
        pushTarget(this); // 下面这个方法，会执行defineReactive里属性的get方法
        // 在get方法里，需要对属性完成依赖注入

        this.getter(); // 依赖删除

        popTarget();
      }
      /**
       * 更新操作
       */

    }, {
      key: "update",
      value: function update() {
        this.get();
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this);
        }
      }
    }]);

    return Watcher;
  }();

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      vm.$el = patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el;

    var updateComponent = function updateComponent() {
      // 将虚拟节点 渲染到页面上
      // 调用render函数，生成虚拟DOM
      // 用虚拟DOM，生成真实DOM
      vm._update(vm._render());
    }; // 实现响应式更新思路：观察者模式
    // 被观察者 data里属性
    // 这是渲染DOM的watcher


    new Watcher(vm, updateComponent, function () {}, true);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 初始化状态，对数据进行初始化

      initState(vm); // 数据劫持
      // 页面挂载

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); // 如果没有render方法

      if (!options.render) {
        var template = options.template; // 如果没有模板但是有el

        if (!template && el) {
          template = el.outerHTML;
        }

        var render = compileToFunctions(template);
        options.render = render;
      }

      mountComponent(vm, el);
    };
  }

  function createTextNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, data, key, children);
  }

  function vnode(vm, tag, data, key, children, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._v = function (text) {
      // 创建文本
      return createTextNode(this, text);
    };

    Vue.prototype._c = function () {
      // 创建元素
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (val) {
      return val == null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render; // 解析出来的render方法

      var vnode = render.call(vm);
      return vnode;
    };
  }

  // 导出vue构造函数

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); // 给原型上新增_init方法

  renderMixin(Vue); // _render

  lifecycleMixin(Vue); // _update

  return Vue;

})));
//# sourceMappingURL=vue.js.map
