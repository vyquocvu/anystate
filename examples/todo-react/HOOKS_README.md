# React Todo App with anyState Hooks

This example demonstrates the new React hooks integration for anyState.

## What's New

The `AppWithHooks.js` file shows how to use the new `useAnyState` hook instead of manually managing `useState` and `watch` calls.

### Before (Traditional Approach)
```jsx
function App() {
  const [todos, setTodos] = useState(store.getItem('todos') || []);
  store.watch('todos', (newTodos) => {
    setTodos(newTodos)
  });
  // ...
}
```

### After (With Hooks)
```jsx
import { useAnyState } from 'anystate';

function AppWithHooks() {
  const [todos, setTodos] = useAnyState(store, 'todos');
  // That's it! No manual watch setup needed
}
```

## Benefits

1. **Cleaner Code**: No need to manually set up watch listeners
2. **Automatic Cleanup**: The hook handles unsubscribing when component unmounts
3. **Better Performance**: Optimized to prevent unnecessary re-renders
4. **TypeScript Support**: Full type safety when using TypeScript

## Running the Example

```bash
npm install
npm start
```

The app will run on `http://localhost:3000`