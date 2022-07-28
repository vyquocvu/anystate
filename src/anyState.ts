let state: { [key: string]: any } | null = null;
const watchers: { key: string; callback: (state, prevState) => void; }[] = [];

export function createAnyState(initialState) {
  state = JSON.parse(JSON.stringify(initialState));
}

export function getState() {
  return JSON.parse(JSON.stringify(state));;
}

export function setState(newState) {
  const prevState = JSON.parse(JSON.stringify(state));
  state = JSON.parse(JSON.stringify(newState));
  watchers.forEach(watcher => watcher.callback(state, prevState));
}

export function setItem(key, value) {
  if (!state) {
    throw new Error('State is not initialized');
  }
  if (state[key] === undefined) {
    console.warn(`Trying to set item ${key} but it doesn't exist`);
  }
  const prevState = (state[key]);
  state[key] = value;

  watchers.forEach((watcher) => {
    if (watcher) {
      watcher.callback(value, prevState);
    }
  });
}

export function getItem(key) {
  if (!state) {
    throw new Error('State is not initialized');
  }
  return state[key];
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