import type { Key, TPath, WatchCallback, WatchObject } from './type';

const getIn = (state, keys: Key[]) => {
  let cursor = state;
  keys.forEach((key) => {
    if (cursor === undefined) return;
    cursor = cursor[key];
  })
  return cursor;
}

const clonedValues = (value) => {
  if (typeof value === 'object') {
    return JSON.parse(JSON.stringify(value));
  }
  return value;
}

const setIn = (state, paths: Key[], value) => {
  let cursor = state;
  let cloneValue =  value;
  if (typeof value === 'object') {
    cloneValue = clonedValues(value);
  }
  paths.forEach((path, index) => {
    if (cursor === undefined) {
      return;
    }
    if (index === paths.length - 1) {
      cursor[path] = cloneValue;
    } else {
      cursor = cursor[path];
    }
  })
  return state;
}

/**
 * @param {string} path
 * @returns {Key[]}
 */
const getPaths = (path: string): Key[] => {
  return path.split(/\[|\]|\./g)
    .reduce((acc, curr) => {
      if (curr === '' || curr === null || curr === undefined) {
        return acc;
      }

      if (/^\d+$/.test(curr)) {
        acc.push(parseInt(curr, 10));
      } else {
        acc.push(curr);
      }
      return acc
    } , []);
}

/**
 * @param {Key[]} paths
 * @returns {string}
*/
const getIdPath = (paths: Key[]): string => {
  return paths.join('/');
}

const AnyState = function(initialized) {
  const watchers: {
    key: string;
    paths: Key[];
    callback: (state, prevState) => void;
  }[] = [];
  const proxiesStack = [];

  var validator = (route = []) => ({
    get(target, key) {
      const childRoute = route.concat([key]);
      // children are object validated
      // proxy are not existed

      if (
        target[key] !== null &&
        typeof target[key] === 'object' &&
        !proxiesStack.includes(childRoute)
      ) {
        return new Proxy(target[key], validator(childRoute));
      }
      return target[key];
    },
    set (target, key, value) {
      const childRoute = route.concat([key]);
      let shallowState = clonedValues(state);
      const idPath = getIdPath(childRoute);
      target[key] = value;
      watchers.forEach((watcher) => {
        // if the watcher is watching the same path as the item being set
        // children of the path will also be updated
        if (watcher && watcher.key.indexOf(idPath) === 0) {
          const prevValue = getIn(shallowState, watcher.paths);
          const nextValue = getIn(state, watcher.paths);
          if (typeof prevValue !== typeof nextValue) {
            console.warn(`Type mismatch for ${key}`);
          }
          watcher.callback(nextValue, prevValue);
        }
      });
      return true;
    },
  });

  let state: { [key: string]: any } | null = new Proxy(initialized, validator());

  /**
   *
   * @returns {any}
   */
  const getState = () => {
    return clonedValues(state);
  }

  /**
   *
   * @param newState: { [key: string]: any }
   * @returns {void}
   */
  const setState = (newState) => {
    state = new Proxy(newState, validator());
  }

  /**
   *
   * @param key {string}
   * @param value
   */
  const setItem = (key: TPath, value: any) => {
    let paths: Key[] = [];
    if (!Array.isArray(key) && typeof key !== 'string' && typeof key !== 'number') {
      throw new Error('setItem: key must be a string or an array of strings');
    }

    if (!state) {
      throw new Error('State is not initialized');
    }

    if (typeof key === 'string') {
      paths = getPaths(key);
    } else if (typeof key === 'number') {
      paths = [key];
    } else if (Array.isArray(key)) {
      paths = key;
    }

    if (getIn(state, paths) === undefined) {
      console.warn(`Trying to set item ${key} but it doesn't exist`);
    }

    state = setIn(state, paths, value);
  }

  /**
   *
   * @param path {string}
   * @returns {any}
   */
  const getItem = (path: Key[] | string) => {
    let paths = path as Key[];
    let item = undefined;

    if (!Array.isArray(path) && typeof path !== 'string' && typeof path !== 'number') {
      throw new Error('setItem: key must be a string or an array of strings');
    }
    if (typeof path === 'string') {
      paths = getPaths(path);
    }

    item = getIn(state, paths);
    return clonedValues(item);
  }

  /**
   * Watch for changes on state properties
   * @param key {string | WatchObject} - Either a path string or an object with path-callback pairs
   * @param callback {WatchCallback} - Optional callback when key is string
   */
  const watch = (key: string | WatchObject, callback?: WatchCallback) => {
    if (!state) {
      throw new Error('State is not initialized');
    }

    // Handle object-based watching (Vue-like)
    if (typeof key === 'object' && key !== null && !Array.isArray(key)) {
      Object.keys(key).forEach(path => {
        const pathCallback = key[path];
        if (typeof pathCallback !== 'function') {
          throw new Error(`callback for path '${path}' must be a function`);
        }
        const paths = getPaths(path);
        if (getIn(state, paths) === undefined) {
          console.warn(`Trying to watch item ${path} but it doesn't exist`);
        }
        const id = getIdPath(paths);
        watchers.push({ key: id, callback: pathCallback, paths });
      });
      return;
    }

    // Handle string-based watching (existing API)
    if (typeof key === 'string') {
      if (typeof callback !== 'function') {
        throw new Error('callback must be a function');
      }
      const paths = getPaths(key);
      if (getIn(state, paths) === undefined) {
        console.warn(`Trying to watch item ${key} but it doesn't exist`);
      }
      const id = getIdPath(paths);
      watchers.push({ key: id, callback, paths });
      return;
    }

    throw new Error('watch: first argument must be a string path or an object with path-callback pairs');
  }

  return {
    setState,
    setItem,
    getState,
    getItem,
    watch,
  }
};

export const createStore = (initialState) => {
  const anyState = AnyState(clonedValues(initialState));
  return anyState;
}
