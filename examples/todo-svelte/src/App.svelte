<script>
	import { store } from "./store.js";
	let text = '';
	let { todos = [] } = store.getItem('todos');

	function addTodo () {
		if (!text) return;
		todos = [...todos, { text, status: '' }];
		store.setItem('todos', todos);
		text = '';
	}
	function removeTodo (index) {
		todos = [...todos.slice(0, index), ...todos.slice(index + 1)];
		store.setItem('todos', todos);
	}

	function toggleTodo (index) {
		todos = [...todos.slice(0, index), { ...todos[index], status: todos[index].status === 'done' ? '' : 'done' }, ...todos.slice(index + 1)];
		store.setItem('todos', todos);
	}

	store.watch('todos', _ => {
		todos = store.getItem('todos');
	});

	export let name;
</script>

<main>
	<h1>TODO {name}!</h1>
	<ul>
		{#each todos as todo, i}
			<li>
				<input on:change={() => toggleTodo(i)} checked={todo.status === 'done'} type="checkbox" />
				{todo.text}
				<button on:click={() => removeTodo(i)}> Remove </button>
			</li>
		{/each}
	<div>
		<input placeholder='new todo' type="text" bind:value={text} />
		<button on:click={addTodo}>Create</button>
	</div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>