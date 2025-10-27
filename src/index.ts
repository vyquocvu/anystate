import type { Key, TPath, WatchCallback, WatchObject } from './type';

const isObject = (value: any): value is object => {
  return value !== null && typeof value === 'object';
};

const getIn = <T extends object>(state: T, keys: Key[]): any => {
  let cursor: any = state;
  for (const key of keys) {
    if (cursor === undefined || cursor === null) {
      return undefined;
    }
    cursor = cursor[key];
  }
  return cursor;
};

const clonedValues = <T>(value: T): T => {
  if (isObject(value)) {
    return JSON.parse(JSON.stringify(value));
  }
  return value;
};

const setIn = <T extends object>(state: T, paths: Key[], value: any): T => {
  let cursor: any = state;
  const lastPath = paths.pop();

  if (lastPath === undefined) {
    return state;
  }

  for (const path of paths) {
    cursor = cursor[path];
    if (!isObject(cursor)) {
      return state;
    }
  }

  if (isObject(cursor)) {
    (cursor as any)[lastPath] = value;
  }

  return state;
};

const getPaths = (path: string): Key[] => {
  return path.split(/\[|\]|\./g).reduce((acc: Key[], curr) => {
    if (curr === '' || curr === null || curr === undefined) {
      return acc;
    }
    if (/^\d+$/.test(curr)) {
      acc.push(parseInt(curr, 10));
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
};

const getIdPath = (paths: Key[]): string => {
  return paths.join('/');
};

const AnyState = function <T extends object>(initialized: T) {
  const pristineState = clonedValues(initialized);
  type Watcher<V = any> = {
    key: string;
    paths: Key[];
    callback: WatchCallback<V>;
  };

  const watchers: Watcher[] = [];

  const validator = (route: Key[] = []) => ({
    get(target: object, key: string | symbol): any {
      const childRoute = [...route, key as Key];

      const targetValue = Reflect.get(target, key);

      if (isObject(targetValue)) {
        return new Proxy(targetValue, validator(childRoute));
      }
      return targetValue;
    },
    set(target: object, key: string | symbol, value: any): boolean {
      const shallowState = clonedValues(state);
      Reflect.set(target, key, value);
      const childRoute = [...route, key as Key];
      const idPath = getIdPath(childRoute);

      watchers.forEach((watcher) => {
        if (watcher && watcher.key.startsWith(idPath)) {
          const prevValue = getIn(shallowState as T, watcher.paths);
          const nextValue = getIn(state as T, watcher.paths);
          watcher.callback(nextValue, prevValue);
        }
      });

      return true;
    },
  });

  let state: T | null = new Proxy(initialized, validator()) as T;

  const getState = (): T | null => {
    return clonedValues(state);
  };

  const setState = (newState: T) => {
    const shallowState = clonedValues(state);
    state = new Proxy(newState, validator()) as T;
    watchers.forEach((watcher) => {
      if (watcher) {
        const prevValue = getIn(shallowState as T, watcher.paths);
        const nextValue = getIn(state as T, watcher.paths);
        if (prevValue !== nextValue) {
          watcher.callback(nextValue, prevValue);
        }
      }
    });
  };

  const reset = () => {
    setState(clonedValues(pristineState));
  };

  const setItem = (key: TPath, value: any) => {
    let paths: Key[] = [];
    if (typeof key !== 'string' && typeof key !== 'number' && !Array.isArray(key)) {
      throw new Error('setItem: key must be a string, number, or an array of keys');
    }

    if (!state) {
      throw new Error('State is not initialized');
    }

    if (typeof key === 'string') {
      paths = getPaths(key);
    } else if (typeof key === 'number') {
      paths = [key];
    } else {
      paths = key;
    }

    if (getIn(state, paths) === undefined) {
      console.warn(`Trying to set item ${key.toString()} but it doesn't exist`);
    }

    state = setIn(state, paths, value);
  };

  const getItem = <V = any>(path: TPath): V | undefined => {
    let paths: Key[];
    if (typeof path === 'string') {
      paths = getPaths(path);
    } else if (typeof path === 'number') {
      paths = [path];
    } else if (Array.isArray(path)) {
      paths = path;
    } else {
      throw new Error('getItem: path must be a string, number, or an array of keys');
    }

    if (!state) return undefined;

    const item = getIn(state, paths);
    return clonedValues(item);
  };

  const watch = <V = any>(key: string | WatchObject<V>, callback?: WatchCallback<V>) => {
    if (!state) {
      throw new Error('State is not initialized');
    }

    if (isObject(key) && !Array.isArray(key)) {
      Object.entries(key).forEach(([path, pathCallback]) => {
        if (typeof pathCallback !== 'function') {
          throw new Error(`callback for path '${path}' must be a function`);
        }
        const paths = getPaths(path);
        if (getIn(state as T, paths) === undefined) {
          console.warn(`Trying to watch item ${path} but it doesn't exist`);
        }
        const id = getIdPath(paths);
        watchers.push({ key: id, callback: pathCallback, paths });
      });
      return;
    }

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
  };

  return {
    setState,
    setItem,
    getState,
    getItem,
    watch,
    reset,
  };
};

export const createStore = <T extends object>(initialState: T) => {
  const anyState = AnyState(clonedValues(initialState));
  return anyState;
};

// Export React hooks integration
export { useAnyState, useAnyStateMultiple } from './react';

// Export Vue composables integration
export { 
  useAnyState as useAnyStateVue, 
  useAnyStateMultiple as useAnyStateMultipleVue,
  useAnyStateComputed 
} from './vue';

// Export Svelte stores integration
export {
  createAnyStateStore,
  createAnyStateStores,
  createAnyStateDerived,
  createAnyStateReadable
} from './svelte';

// Export persistence plugins
export {
  addPersistence,
  localStoragePlugin,
  sessionStoragePlugin,
  indexedDBPlugin,
  createCustomPlugin
} from './persistence';
export type { PersistencePlugin, PersistenceOptions } from './persistence';
