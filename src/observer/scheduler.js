import {
    nextTick
} from '../utils/next-tick'
let has = {};
let queue = [];

function flushSchedulerQueue() {
    for (let i = 0; i < queue.length; i++) {
        let watcher = queue[i];
        watcher.run()
    }
    queue = [];
    has = {}
}
let pending = false

/**
 * 防抖
 * 属性的多次更改操作，指执行一次
 * @param {*} watcher 
 */
export function queueWatcher(watcher) {
    const id = watcher.id;
    if (has[id] == null) {
        has[id] = true;
        queue.push(watcher);
        if (!pending) {
            nextTick(flushSchedulerQueue)
            pending = true;
        }
    }
}