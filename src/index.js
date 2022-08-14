"use strict";
exports.__esModule = true;
exports.createAnyState = void 0;
var getIn = function (state, keys) {
    var cursor = state;
    keys.forEach(function (key) {
        if (cursor === undefined)
            return;
        cursor = cursor[key];
    });
    return cursor;
};
var clonedValues = function (value) {
    if (typeof value === 'object') {
        return value;
    }
    return value;
};
var setIn = function (state, paths, value) {
    var cursor = state;
    var cloneValue = value;
    if (typeof value === 'object') {
        cloneValue = (value);
    }
    paths.forEach(function (path, index) {
        if (cursor === undefined) {
            return;
        }
        if (index === paths.length - 1) {
            cursor[path] = cloneValue;
        }
        else {
            cursor = cursor[path];
        }
    });
    return state;
};
var toObject = function (value) {
    if (typeof value === 'object') {
        return clonedValues(value);
    }
    return value;
};
/**
 * @param {string} path
 * @returns {Key[]}
 */
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
/**
 * @param {Key[]} paths
 * @returns {string}
*/
var getIdPath = function (paths) {
    return paths.join('/');
};
var AnyState = function (initialized) {
    var watchers = [];
    var validator = function (route) {
        if (route === void 0) { route = []; }
        return ({
            get: function (target, key) {
                if (typeof target[key] === 'object' && target[key] !== null) {
                    var childRoute = route.concat([key]);
                    return new Proxy(target[key], validator(childRoute));
                }
                return target[key];
            },
            set: function (target, key, value) {
                var childRoute = route.concat([key]);
                var shallowState = clonedValues(state);
                var idPath = getIdPath(childRoute);
                target[key] = value;
                watchers.forEach(function (watcher) {
                    // if the watcher is watching the same path as the item being set
                    // children of the path will also be updated
                    if (watcher && watcher.key.indexOf(idPath) === 0) {
                        var prevValue = getIn(shallowState, watcher.paths);
                        var nextValue = getIn(state, watcher.paths);
                        if (typeof prevValue !== typeof nextValue) {
                            console.warn("Type mismatch for ".concat(key));
                        }
                        watcher.callback(nextValue, prevValue);
                    }
                });
                return true;
            }
        });
    };
    var state = new Proxy(initialized, validator());
    /**
     *
     * @returns {any}
     */
    var getState = function () {
        return toObject(state);
    };
    /**
     *
     * @param newState: { [key: string]: any }
     * @returns {void}
     */
    var setState = function (newState) {
        state = new Proxy(newState, validator());
    };
    /**
     *
     * @param key {string}
     * @param value
     */
    var setItem = function (key, value) {
        var paths = [];
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
        if (getIn(state, paths) === undefined) {
            console.warn("Trying to set item ".concat(key, " but it doesn't exist"));
        }
        state = setIn(state, paths, value);
    };
    /**
     *
     * @param path {string}
     * @returns
     */
    var getItem = function (path) {
        var paths = path;
        var item = undefined;
        if (!Array.isArray(path) && typeof path !== 'string' && typeof path !== 'number') {
            throw new Error('setItem: key must be a string or an array of strings');
        }
        if (typeof path === 'string') {
            paths = getPaths(path);
        }
        item = getIn(state, paths);
        return toObject(item);
    };
    /**
     *
     * @param key {string}
     * @param callback {(state, prevState) => void}
     */
    var watch = function (key, callback) {
        if (!state) {
            throw new Error('State is not initialized');
        }
        if (typeof callback !== 'function') {
            throw new Error('callback must be a function');
        }
        var paths = getPaths(key);
        if (getIn(state, paths) === undefined) {
            console.warn("Trying to watch item ".concat(key, " but it doesn't exist"));
        }
        var id = getIdPath(paths);
        watchers.push({ key: id, callback: callback, paths: paths });
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
    var anyState = AnyState(clonedValues(initialState));
    return anyState;
};
exports.createAnyState = createAnyState;
