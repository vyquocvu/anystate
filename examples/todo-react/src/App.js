import './App.css';
import { useState } from 'react';
import { store } from './store';
import ButtonCreate from './buttonCreate';
import TodoItem from './TodoItem';

function App() {
  const [todos, setTodos] = useState(store.getItem('todos') || []);
  store.watch('todos', (newTodos) => {
    setTodos(newTodos)
  });

  return (
    <div className="App">
      {
        todos.map((todo, index) => (
          <TodoItem item={todo} index={index} key={index}/>
        ))
      }
      <ButtonCreate total={todos.length} />
    </div>
  );
}

export default App;
