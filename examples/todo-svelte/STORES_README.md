# Svelte Todo App with anyState Stores

This example demonstrates the new Svelte stores integration for anyState.

## What's New

The anyState library now provides native Svelte store integration with these functions:

- `createAnyStateStore(store, path)` - Creates a writable Svelte store
- `createAnyStateStores(store, paths)` - Creates multiple stores at once
- `createAnyStateDerived(store, paths, deriveFn)` - Creates derived stores
- `createAnyStateReadable(store, path)` - Creates read-only stores

### Before (Manual Integration)
```svelte
<script>
  import { createStore } from 'anystate';
  import { writable } from 'svelte/store';
  
  const store = createStore({ todos: [] });
  const todos = writable(store.getItem('todos'));
  
  store.watch('todos', (newTodos) => {
    todos.set(newTodos);
  });
</script>
```

### After (With Stores Integration)
```svelte
<script>
  import { createStore, createAnyStateStore } from 'anystate';
  
  const store = createStore({ todos: [] });
  const todos = createAnyStateStore(store, 'todos');
  
  // That's it! The store automatically stays in sync
</script>

<div>
  {#each $todos as todo}
    <p>{todo.text}</p>
  {/each}
</div>
```

## Benefits

1. **Native Svelte Integration**: Works seamlessly with Svelte's reactivity system
2. **Automatic Synchronization**: Changes in anyState automatically update Svelte stores
3. **Bidirectional Binding**: Changes in Svelte stores update anyState
4. **Standard Svelte API**: Use familiar `$store` syntax and store methods
5. **TypeScript Support**: Full type safety when using TypeScript

## Running the Example

```bash
npm install
npm run dev
```

The app will run on `http://localhost:5000`