import * as Immutable from 'seamless-immutable';

type Key = string | number;
type TPath = Key | Key[];

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

const AnyState = function() {
  let state: { [key: string]: any } | null = null;
  const watchers: {
    key: string;
    callback: (state, prevState) => void;
    paths: TPath;
  }[] = [];

  /**
   *
   * @returns {any}
   */
  const getState = () => {
    return Immutable.asMutable(state, { deep: true });
  }

  /**
   *
   * @param newState: { [key: string]: any }
   * @returns {void}
   */
  const setState = (newState) => {
    state = Immutable(newState);
    watchers.forEach(watcher => watcher.callback(state, newState));
  }

  /**
   *
   * @param key {string}
   * @param value
   */
  const setItem = (key: TPath, value: any) => {
    let paths: Key[] = [];
    let shallowState = Immutable(state);
    let idPath = '';

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

    idPath = getIdPath(paths);

    if (Immutable.getIn(state, paths) === undefined) {
      console.warn(`Trying to set item ${key} but it doesn't exist`);
    }

    state = Immutable.setIn(state, paths, value);

    watchers.forEach((watcher) => {
      // if the watcher is watching the same path as the item being set
      // children of the path will also be updated
      if (watcher && watcher.key.indexOf(idPath) === 0) {
        const prevValue = Immutable.getIn(shallowState, watcher.paths)?.asMutable({ deep: true });
        const nextValue = Immutable.getIn(state, watcher.paths)?.asMutable({ deep: true });
        if (typeof prevValue !== typeof nextValue) {
          console.warn(`Type mismatch for ${key}`);
        }
        watcher.callback(nextValue, prevValue);
      }
    });
  }

  /**
   *
   * @param path {string}
   * @returns
   */
  const getItem = (path: TPath[] | string) => {
    let paths = path;
    let item = undefined;

    if (!Array.isArray(path) && typeof path !== 'string' && typeof path !== 'number') {
      throw new Error('setItem: key must be a string or an array of strings');
    }
    if (typeof path === 'string') {
      paths = getPaths(path);
    }

    item = Immutable.getIn(state, paths);
    return Immutable.asMutable(item, { deep: true });
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
    if (Immutable.getIn(state, paths) === undefined) {
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
  const state = Immutable(initialState);
  const anyState = AnyState();
  anyState.setState(state);
  return anyState;
}
