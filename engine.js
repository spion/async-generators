var Promise = require('bluebird')


function YieldRequest(val) {
    this.put = val;
}

YieldRequest.is = function(val) {
    return val instanceof YieldRequest;
}

function AsyncIterator(iterator) {
    this.iterator = iterator
}

function isThenable(val) {
    return val != null && typeof val.then === 'function';
}

AsyncIterator.prototype.next = function(value) {
    try {
        var result = this.iterator.next(value)
        if (isThenable(result.value)) {
            return Promise.resolve(result.value).bind(this).then(this.next)
        } else if (YieldRequest.is(result.value)) {
            return Promise.resolve({value: result.value.put, done: result.done});
        } else if (result.done) {
            return Promise.resolve({value: result.value, done: result.done})
        }
    } catch (e) {
        return Promise.reject(e)
    }
}

function iterate(asyncIter, cb) {
    function handleValue(v) {
        var p = cb(v.value);
        if (v.done) return Promise.resolve(p);
        else return Promise.resolve(p).then(again);
    }
    function again(v) {
        return asyncIter.next(v).then(handleValue)
    }
    return again();
}

module.exports = function async(gen) {
    return function() {
        var it = gen.apply(this, arguments);
        return new AsyncIterator(it);
    }
}

module.exports.yield = function ayield(val) {
    return new YieldRequest(val);
}

module.exports.await = function await(val) {
    return val;
}

module.exports.iterate = iterate;