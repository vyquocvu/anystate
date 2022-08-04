import * as Immutable from 'seamless-immutable';

type Key = string | number;
type TPath = Key | Key[];

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

const getIdPath = (paths: TPath[]): string => {
  return paths.join('/');
}

const AnyState = function() {
  let state: { [key: string]: any } | null = null;
  const watchers: {
    key: string;
    callback: (state, prevState) => void;
    paths: TPath;
  }[] = [];

  const getState = () => {
    return Immutable.asMutable(state);
  }

  const setState = (newState) => {
    state = Immutable(newState);
    watchers.forEach(watcher => watcher.callback(state, newState));
  }

  const setItem = (key: TPath, value: any) => {
    let paths: Key[] = [];
    let prevValue = undefined;
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

    prevValue = Immutable.getIn(state, paths);
    state = Immutable.setIn(state, paths, value);

    watchers.forEach((watcher) => {
      // if the watcher is watching the same path as the item being set
      // children of the path will also be updated
      if (watcher && watcher.key.indexOf(idPath) === 0) {
        const prevValue = Immutable.getIn(shallowState, watcher.paths);
        const nextValue = Immutable.getIn(state, watcher.paths);
        if (typeof prevValue !== typeof nextValue) {
          console.warn(`Type mismatch for ${key}`);
        }
        watcher.callback(nextValue, prevValue);
      }
    });
  }

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
    return item;
  }

  const watch = (key, callback) => {
    if (!state) {
      throw new Error('State is not initialized');
    }
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }
    const paths = getPaths(key);
    if (Immutable.getIn(state, paths) === undefined) {
      throw new Error(`state ${key} must be defined on constructor`);
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

export default AnyState;