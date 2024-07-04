// Change this as per production
const apiUrl = `${window.location.origin}/api/todos`;

async function fetchTodos() {
    try {
        const response = await axios.get(apiUrl);
        const todos = response.data;
        const todoList = document.getElementById('todo-list');
        todoList.innerHTML = '';

        if (todos.length === 0) {
            todoList.innerHTML = '<li>No TODOs created</li>';
        } else {
            todos.forEach(todo => {
                const todoItem = document.createElement('li');
                todoItem.innerHTML = `
                    ${todo.title} 
                    <button onclick="editTodo(${todo.id}, '${todo.title}', ${todo.completed})" class="bg-yellow-500 text-white p-1 ml-2">Edit</button>
                    <button onclick="deleteTodo(${todo.id})" class="bg-red-500 text-white p-1 ml-2">Delete</button>
                `;
                todoList.appendChild(todoItem);
            });
        }
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

async function addTodo() {
    const newTodoInput = document.getElementById('new-todo');
    const title = newTodoInput.value;
    if (title) {
        try {
            await axios.post(apiUrl, { title });
            newTodoInput.value = '';
            fetchTodos();
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    }
}

async function editTodo(id, currentTitle, currentCompleted) {
    const newTitle = prompt('Edit TODO title', currentTitle);
    if (newTitle !== null) {
        try {
            await axios.put(`${apiUrl}/${id}`, { title: newTitle, completed: currentCompleted });
            fetchTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    }
}

async function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this TODO?')) {
        try {
            await axios.delete(`${apiUrl}/${id}`);
            fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }
}

fetchTodos();
