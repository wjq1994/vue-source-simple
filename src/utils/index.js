export function isFunction(data) {
    return typeof data === 'function';
}

export function isObject(data) {
    return typeof data === 'object' && data !== null;
}

/**
 * 合并生命周期
 */
export const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
]
const strats = {};
function mergeAssets(parentVal, childVal) {
    // 不能拷贝 防止覆盖父
    const res = Object.create(parentVal); // 根据父对象构造一个新对象 options.__proto__, 先找本身，再找父
    if (childVal) {
        for (let key in childVal) {
            res[key] = childVal[key];
        }
    }
    return res;
}
strats.components = mergeAssets;

function mergeHook(parentVal, childValue) {
    if (childValue) {
        if (parentVal) {
            return parentVal.concat(childValue);
        } else {
            return [childValue]
        }
    } else {
        return parentVal;
    }
}
/**
 * 策略模式
 */
LIFECYCLE_HOOKS.forEach(hook => {
    strats[hook] = mergeHook
})
export function mergeOptions(parent, child) {
    const options = {}
    for (let key in parent) {
        mergeField(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key);
        }
    }
    function mergeField(key) {
        // 策略模式
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key]);
        } else {
            if (typeof parent[key] == 'object' && typeof child[key] == 'object') {
                options[key] = {
                    ...parent[key],
                    ...child[key]
                }
            } else {
                // 有可能父亲中有
                options[key] = child[key] || parent[key];
            }
        }
    }

    return options
}

/**
 * 
 * @param {*} str 
 */
function makeMap(str) {
    const map = {};
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return (key) => map[key];
}

/**
 * 导出组件节点
 */
export const isReservedTag = makeMap(
    'a,div,img,image,text,span,input,p,button,li,ul'
)