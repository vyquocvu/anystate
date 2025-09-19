import React, { useEffect, useState } from 'react';
import { createStore, useAnyState, addPersistence, localStoragePlugin } from 'anystate';

// Create store with initial state
const store = createStore({
  user: {
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      notifications: true
    }
  },
  todos: []
});

// Add persistence
let persistence;
addPersistence(store, {
  plugins: [localStoragePlugin('todo-app-state')],
  autoSave: true,
  throttle: 500
}).then(p => {
  persistence = p;
  // Load existing state when app starts
  return persistence.load();
});

function PersistentTodoApp() {
  const [name, setName] = useAnyState(store, 'user.name');
  const [theme, setTheme] = useAnyState(store, 'user.preferences.theme');
  const [todos, setTodos] = useAnyState(store, 'todos');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for persistence to load
    const loadData = async () => {
      if (persistence) {
        await persistence.load();
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: `Todo ${todos.length + 1}`,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };

  const clearData = async () => {
    if (persistence) {
      await persistence.clear();
      // Reset to initial state
      setName('');
      setTheme('light');
      setTodos([]);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`app theme-${theme}`}>
      <h1>Persistent Todo App</h1>
      
      <div className="user-section">
        <h2>User Settings (Auto-saved to localStorage)</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light Theme</option>
          <option value="dark">Dark Theme</option>
        </select>
      </div>

      <div className="todos-section">
        <h2>Todos (Persisted)</h2>
        <button onClick={addTodo}>Add Todo</button>
        <ul>
          {todos.map(todo => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button onClick={clearData}>Clear All Data</button>
        <p>All changes are automatically saved to localStorage!</p>
      </div>
    </div>
  );
}

export default PersistentTodoApp;