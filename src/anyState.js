class AnyState {
  constructor(state) {
    this.state = state;
    this.watchers = {};
  }

  getState() {
    return this.state;
  }

  setState(state) {
    this.state = state;
    Object.keys(this.watchers).forEach((key) => {
      this.watchers[key](this.state[key]);
    });
  }

  setItem(key, value) {
    this.state[key] = value;
    if (this.watchers[key]) {
      this.watchers[key](value);
    }
  }

  getItem(key) {
    return this.state[key];
  }

  watch(key, callback) {
    if (typeof callback === 'function') {
      throw new Error('callback must be a function');
    }
    if (this.state[key] === undefined) {
      throw new Error(`state ${key} must be defined on constructor`);
    }

    if (this.watchers[key]) {
      console.warn(`${key} is already watched`);
    }
    this.watchers[key] = callback;
  }
}