"use strict";
exports.__esModule = true;
exports.createAnyState = void 0;
var Immutable = require("seamless-immutable");
var getPaths = function (path) {
    return path.split(/\[|\]|\./g)
        .reduce(function (acc, curr) {
        if (curr === '' || curr === null || curr === undefined) {
            return acc;
        }
        if (/^\d+$/.test(curr)) {
            acc.push(parseInt(curr, 10));
        }
        else {
            acc.push(curr);
        }
        return acc;
    }, []);
};
var getIdPath = function (paths) {
    return paths.join('/');
};
var AnyState = function () {
    var state = null;
    var watchers = [];
    var getState = function () {
        return Immutable.asMutable(state);
    };
    var setState = function (newState) {
        state = Immutable(newState);
        watchers.forEach(function (watcher) { return watcher.callback(state, newState); });
    };
    var setItem = function (key, value) {
        var paths = [];
        var prevValue = undefined;
        var idPath = '';
        if (!Array.isArray(key) && typeof key !== 'string' && typeof key !== 'number') {
            throw new Error('setItem: key must be a string or an array of strings');
        }
        if (!state) {
            throw new Error('State is not initialized');
        }
        if (typeof key === 'string') {
            paths = getPaths(key);
        }
        else if (typeof key === 'number') {
            paths = [key];
        }
        else if (Array.isArray(key)) {
            paths = key;
        }
        idPath = getIdPath(paths);
        if (Immutable.getIn(state, paths) === undefined) {
            console.warn("Trying to set item ".concat(key, " but it doesn't exist"));
        }
        prevValue = Immutable.getIn(state, paths);
        state = Immutable.setIn(state, paths, value);
        watchers.forEach(function (watcher) {
            if (watcher && idPath.indexOf(watcher.key) === 0) {
                watcher.callback(value, prevValue);
            }
        });
    };
    var getItem = function (path) {
        var paths = path;
        var item = undefined;
        if (!Array.isArray(path) && typeof path !== 'string' && typeof path !== 'number') {
            throw new Error('setItem: key must be a string or an array of strings');
        }
        if (typeof path === 'string') {
            paths = getPaths(path);
        }
        item = Immutable.getIn(state, paths);
        return item;
    };
    var watch = function (key, callback) {
        if (!state) {
            throw new Error('State is not initialized');
        }
        if (typeof callback !== 'function') {
            throw new Error('callback must be a function');
        }
        var paths = getPaths(key);
        if (Immutable.getIn(state, paths) === undefined) {
            throw new Error("state ".concat(key, " must be defined on constructor"));
        }
        var id = getIdPath(paths);
        watchers.push({ key: id, callback: callback });
    };
    return {
        setState: setState,
        setItem: setItem,
        getState: getState,
        getItem: getItem,
        watch: watch
    };
};
var createAnyState = function (initialState) {
    var state = Immutable(initialState);
    var anyState = AnyState();
    console.log("🚀 ~ file: anyState.ts ~ line 82 ~ createAnyState ~ anyState", anyState);
    anyState.setState(state);
    return anyState;
};
exports.createAnyState = createAnyState;
exports["default"] = AnyState;
