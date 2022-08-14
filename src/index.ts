type Key = string | number;
type TPath = Key | Key[];

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
    return value;
  }
  return value;
}

const setIn = (state, paths: Key[], value) => {
  let cursor = state;
  let cloneValue =  value;
  if (typeof value === 'object') {
    cloneValue = (value);
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

const toObject = (value) => {
  if (typeof value === 'object') {
    return clonedValues(value);
  }
  return value;
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

  var validator = (route = []) => ({
    get(target, key) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        const childRoute = route.concat([key]);
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
    return toObject(state);
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
   * @returns
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
    return toObject(item);
  }

  /**
   *
   * @param key {string}
   * @param callback {(state, prevState) => void}
   */
  const watch = (key, callback) => {
    if (!state) {
      throw new Error('State is not initialized');
    }
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }
    const paths = getPaths(key);
    if (getIn(state, paths) === undefined) {
      console.warn(`Trying to watch item ${key} but it doesn't exist`);
    }
    const id = getIdPath(paths);
    watchers.push({ key: id, callback, paths });
  }

  return {
    setState,
    setItem,
    getState,
    getItem,
    watch,
  }
};

export const createAnyState = (initialState) => {
  const anyState = AnyState(clonedValues(initialState));
  return anyState;
}
