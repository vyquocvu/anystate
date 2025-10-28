const assert = require('assert');
const React = require('react');
const { act } = require('react-dom/test-utils');
const { createRoot } = require('react-dom/client');
const { JSDOM } = require('jsdom');
const { createStore, useAnyState, useAnyStateMultiple } = require('../dist/index');

describe('React Hooks', () => {
  let store;
  let container;
  let root;
  let dom;

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
    global.window = dom.window;
    global.document = dom.window.document;
    store = createStore({
      user: { name: 'John', age: 30 },
      items: ['apple', 'banana'],
    });
    container = document.getElementById('root');
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.innerHTML = '';
  });

  it('useAnyState should read and update state', () => {
    const TestComponent = () => {
      const [name, setName] = useAnyState(store, 'user.name');
      return React.createElement('div', {
        onClick: () => setName('Doe'),
      }, name);
    };

    act(() => {
      root.render(React.createElement(TestComponent));
    });

    assert.strictEqual(container.textContent, 'John');

    act(() => {
      container.firstChild.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    });

    assert.strictEqual(container.textContent, 'Doe');
  });

  it('useAnyStateMultiple should read and update multiple state values', () => {
    const TestComponent = () => {
      const state = useAnyStateMultiple(store, {
        name: 'user.name',
        firstItem: 'items[0]',
      });

      return React.createElement('div', {
        onClick: () => {
          state.setName('Jane');
          state.setFirstItem('orange');
        },
      }, `${state.name} ${state.firstItem}`);
    };

    act(() => {
      root.render(React.createElement(TestComponent));
    });

    assert.strictEqual(container.textContent, 'John apple');

    act(() => {
      container.firstChild.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    });

    assert.strictEqual(container.textContent, 'Jane orange');
    assert.deepStrictEqual(store.getState().user.name, 'Jane');
    assert.deepStrictEqual(store.getState().items[0], 'orange');
  });
});
