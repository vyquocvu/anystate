
# anyState

[![npm version](https://badge.fury.io/js/anystate.svg)](https://badge.fury.io/js/anystate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/vyquocvu/anystate/actions/workflows/test.yml/badge.svg)](https://github.com/vyquocvu/anystate/actions/workflows/test.yml)

## What is anyState?

anyState is a tiny, framework-agnostic state management library that works with any frontend framework!

### Key Features
- **Simple Object-based API**: State is just an observable object
- **Path-based Updates**: Update nested values using simple path notation
- **Change Watching**: Subscribe to state changes with callback functions
- **Framework Independent**: Works with React, Vue, Svelte, Solid, or any framework
- **Tiny Bundle Size**: Under 5KB minified
- **TypeScript Support**: Full TypeScript definitions included

Back to basics - anyState uses callback functions to handle state changes. Each change is identified by a unique path string to ensure precise state updates. This allows you to track any changes from anywhere in your application.

## Installation

```bash
npm install anystate
```

```bash
yarn add anystate
```

```bash
pnpm add anystate
```

## Roadmap
- [x] Initialize anyState
- [x] Simple state management
- [x] getItem/setItem with path notation
- [x] Watch onChange functionality
- [x] Vue-like multiple property watching
- [x] TypeScript support
- [x] React hooks integration
- [ ] Vue composables
- [ ] Svelte stores compatibility
- [ ] Persistence plugins


## Usage

### Basic Setup

Import and initialize anyState with `createStore()`:

```js
import { createStore } from 'anystate';

const store = createStore({
  user: {
    name: 'John',
    age: 30,
    preferences: {
      theme: 'dark'
    }
  },
  todos: [
    { id: 1, text: 'Learn anyState', completed: false },
    { id: 2, text: 'Build awesome app', completed: false }
  ]
});
```

### State Management

#### Get entire state
```js
const state = store.getState();
console.log(state); // Returns the entire state object
```

#### Set entire state
```js
store.setState({
  user: {
    name: 'Jane',
    age: 25,
    preferences: {
      theme: 'light'
    }
  },
  todos: []
});
```

### Path-based Operations

anyState supports dot notation and array indexing for nested operations:

#### Set nested values
```js
// Update simple property
store.setItem('user.name', 'Alice');

// Update nested object property
store.setItem('user.preferences.theme', 'auto');

// Update array item
store.setItem('todos[0].completed', true);

// Update nested array property
store.setItem('todos[0].text', 'Learn anyState ✓');
```

#### Get nested values
```js
// Get simple property
const userName = store.getItem('user.name');

// Get nested object
const preferences = store.getItem('user.preferences');

// Get array item
const firstTodo = store.getItem('todos[0]');

// Get nested array property
const isCompleted = store.getItem('todos[0].completed');
```

### Watching State Changes

#### Watch single property
```js
store.watch('user.name', (newValue, oldValue) => {
  console.log(`User name changed from ${oldValue} to ${newValue}`);
});
```

#### Watch multiple properties (Vue-like syntax)
```js
store.watch({
  'user.name': (newValue, oldValue) => {
    console.log(`Name: ${oldValue} → ${newValue}`);
  },
  'user.age': (newValue, oldValue) => {
    console.log(`Age: ${oldValue} → ${newValue}`);
  },
  'todos[0].completed': (newValue, oldValue) => {
    console.log(`First todo completed: ${newValue}`);
  }
});
```

#### Watch complex objects
```js
// Watch entire user object
store.watch('user', (newUser, oldUser) => {
  console.log('User object changed:', { newUser, oldUser });
});

// Watch array changes
store.watch('todos', (newTodos, oldTodos) => {
  console.log(`Todo count: ${oldTodos?.length} → ${newTodos?.length}`);
});
```
## API Reference

### `createStore(initialState)`
Creates a new anyState store instance.

**Parameters:**
- `initialState` (Object): The initial state object

**Returns:** Store instance with the following methods:

#### `getState()`
Returns the entire current state.

#### `setState(newState)`
Replaces the entire state with a new state object.

**Parameters:**
- `newState` (Object): The new state object

#### `getItem(path)`
Gets a value at the specified path.

**Parameters:**
- `path` (string): Dot notation path (e.g., 'user.name', 'items[0].title')

**Returns:** The value at the specified path

#### `setItem(path, value)`
Sets a value at the specified path.

**Parameters:**
- `path` (string): Dot notation path
- `value` (any): The value to set

#### `watch(pathOrObject, callback?)`
Watches for changes at specified paths.

**Parameters:**
- `pathOrObject` (string | Object): Path string or object with path-callback pairs
- `callback` (Function): Callback function for string paths `(newValue, oldValue) => void`

### React Hooks

#### `useAnyState(store, path)`
React hook for subscribing to store values.

**Parameters:**
- `store` (Store): anyState store instance
- `path` (string): Dot notation path to watch

**Returns:** `[value, setValue]` tuple similar to React's `useState`

#### `useAnyStateMultiple(store, paths)`
React hook for subscribing to multiple store values.

**Parameters:**
- `store` (Store): anyState store instance  
- `paths` (Object): Object mapping property names to paths

**Returns:** Object with values and setter functions

## Framework Integration Examples

### React Hooks Integration

anyState now provides built-in React hooks for seamless integration:

#### `useAnyState(store, path)`
A React hook that subscribes to a specific path in the store and returns a stateful value and a setter function.

```jsx
import { createStore, useAnyState } from 'anystate';

const store = createStore({ 
  user: { name: 'John', age: 30 },
  todos: []
});

function UserComponent() {
  const [name, setName] = useAnyState(store, 'user.name');
  const [age, setAge] = useAnyState(store, 'user.age');
  
  return (
    <div>
      <h2>{name} ({age} years old)</h2>
      <button onClick={() => setAge(age + 1)}>
        Birthday! 🎂
      </button>
    </div>
  );
}
```

#### `useAnyStateMultiple(store, paths)`
For watching multiple values at once:

```jsx
function UserForm() {
  const userData = useAnyStateMultiple(store, {
    name: 'user.name',
    age: 'user.age',
    email: 'user.email'
  });
  
  return (
    <form>
      <input 
        value={userData.name} 
        onChange={(e) => userData.setName(e.target.value)} 
      />
      <input 
        value={userData.age} 
        onChange={(e) => userData.setAge(e.target.value)} 
      />
      <input 
        value={userData.email} 
        onChange={(e) => userData.setEmail(e.target.value)} 
      />
    </form>
  );
}
```

### React Hook Example
```jsx
import { createStore, useAnyState } from 'anystate';

const store = createStore({ count: 0 });

function Counter() {
  const [count, setCount] = useAnyState(store, 'count');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// You can also use the hook with nested paths
function UserProfile() {
  const [name, setName] = useAnyState(store, 'user.name');
  const [age, setAge] = useAnyState(store, 'user.age');
  
  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Name" 
      />
      <input 
        type="number" 
        value={age} 
        onChange={(e) => setAge(parseInt(e.target.value))} 
        placeholder="Age" 
      />
    </div>
  );
}
```

### Vue Composition API Example
```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createStore } from 'anystate';

const store = createStore({ count: 0 });
const count = ref(store.getItem('count'));

let unwatch;

onMounted(() => {
  unwatch = store.watch('count', (newValue) => {
    count.value = newValue;
  });
});

onUnmounted(() => {
  if (unwatch) unwatch();
});

const increment = () => {
  store.setItem('count', store.getItem('count') + 1);
};
</script>
```

## Examples

Explore complete working examples in different frameworks:

- **[React Todo App](/examples/todo-react)** - Complete todo application with React
- **[Solid Todo App](/examples/todo-solid)** - Todo app built with SolidJS  
- **[Svelte Todo App](/examples/todo-svelte)** - Todo app using Svelte

Each example demonstrates:
- State initialization and management
- Path-based updates for nested data
- Change watching and UI reactivity
- Framework-specific integration patterns

## Development

### Setup
```bash
# Install dependencies
npm install

# Run tests
npm test

# Development mode (TypeScript watch)
npm run dev

# Build for production
npm run build
```

### Project Structure
```
├── src/
│   ├── index.ts        # Main library code
│   └── type.d.ts       # TypeScript definitions
├── test/               # Test files
├── examples/           # Framework examples
│   ├── todo-react/     # React example
│   ├── todo-solid/     # Solid example
│   └── todo-svelte/    # Svelte example
└── dist/              # Built files
```

### Running Examples
```bash
# React example
cd examples/todo-react && npm install && npm start

# Solid example  
cd examples/todo-solid && npm install && npm start

# Svelte example
cd examples/todo-svelte && npm install && npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

MIT License - see [LICENSE.md](License.md) for details.
