import './App.css';
import { useAnyState } from 'anystate';
import { store } from './store';
import ButtonCreate from './buttonCreate';
import TodoItem from './TodoItem';

function AppWithHooks() {
  // Using the new useAnyState hook instead of manual useState + watch
  const [todos, setTodos] = useAnyState(store, 'todos');

  return (
    <div className="App">
      <h1>Todo App with anyState React Hooks</h1>
      <p>This version uses the new useAnyState hook for cleaner integration</p>
      {
        (todos || []).map((todo, index) => (
          <TodoItem item={todo} index={index} key={index}/>
        ))
      }
      <ButtonCreate total={(todos || []).length} />
    </div>
  );
}

export default AppWithHooks;