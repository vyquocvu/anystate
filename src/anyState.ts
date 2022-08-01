import * as Immutable from 'seamless-immutable';

let state: { [key: string]: any } | null = null;
const watchers: { key: string; callback: (state, prevState) => void; }[] = [];

export function createAnyState(initialState) {
  if (state) {
    throw new Error('AnyState already created');
  }
  state = Immutable(initialState);
}

export function getState() {
  return Immutable.asMutable(state);
}

export function setState(newState) {
  state = Immutable(newState);
  watchers.forEach(watcher => watcher.callback(state, newState));
}

export function setItem(key, value) {
  let paths = key;
  let prevValue = undefined;

  if (!Array.isArray(key) && typeof key !== 'string' && typeof key !== 'number') {
    throw new Error('setItem: key must be a string or an array of strings');
  }

  if (!state) {
    throw new Error('State is not initialized');
  }

  if (typeof key === 'string') {
    paths =  key.split('.').map((k) => /^\d+$/.test(k) ? parseInt(k, 10) : k);
  } else if (typeof key === 'number') {
    paths = [key];
  }

  if (Immutable.getIn(state, paths) === undefined) {
    console.warn(`Trying to set item ${key} but it doesn't exist`);
  }

  prevValue = Immutable.getIn(state, paths);
  state = Immutable.setIn(state, paths, value);

  watchers.forEach((watcher) => {
    if (watcher && watcher.key === key) {
      watcher.callback(value, prevValue);
    }
  });
}

export function getItem(key) {
  let paths = key;
  let item = undefined;

  if (!Array.isArray(key) && typeof key !== 'string' && typeof key !== 'number') {
    throw new Error('setItem: key must be a string or an array of strings');
  }
  if (typeof key === 'string') {
    paths =  key.split('.').map((k) => /^\d+$/.test(k) ? parseInt(k, 10) : k);
  }

  item = Immutable.getIn(state, paths);
  return item;
}

export function watch(key, callback) {
  if (!state) {
    throw new Error('State is not initialized');
  }
  if (typeof callback !== 'function') {
    throw new Error('callback must be a function');
  }
  if (state[key] === undefined) {
    throw new Error(`state ${key} must be defined on constructor`);
  }
  watchers.push({ key, callback });
}