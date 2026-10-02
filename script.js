const todoInput = document.getElementById("todoInput");
const daysInput = document.getElementById("daysInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

function addTodo() {
    const title = todoInput.value.trim();
    const targetDays = parseInt(daysInput.value);

    if (!title || !targetDays || targetDays < 1) {
        return;
    }

    const newTodo = {
        id: Date.now(),
        title: title,
        targetDays: targetDays,
        currentDay: 1,
        days: [],
        completed: false
    };

    todos.push(newTodo);

    saveTodos();
    renderTodos();

    todoInput.value = "";
    daysInput.value = "";
}

function setDayStatus(todoId, status) {
    const todo = todos.find(todo => todo.id === todoId);

    if (!todo || todo.completed) {
        return;
    }

    todo.days[todo.currentDay - 1] = status;

    saveTodos();
    renderTodos();
}

function nextDay(todoId) {
    const todo = todos.find(todo => todo.id === todoId);

    if (!todo || todo.completed) {
        return;
    }

    const currentStatus = todo.days[todo.currentDay - 1];

    if (!currentStatus) {
        return;
    }

    if (todo.currentDay === todo.targetDays) {
        if (todo.days.every(day => day === "done")) {
            todo.completed = true;
        }

        saveTodos();
        renderTodos();
        return;
    }

    todo.currentDay++;

    saveTodos();
    renderTodos();
}

function deleteTodo(todoId) {
    todos = todos.filter(todo => todo.id !== todoId);
    saveTodos();
    renderTodos();
}

function getCompletedDays(todo) {
    return todo.days.filter(day => day === "done").length;
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function renderTodos() {
    todoList.innerHTML = "";

    if (todos.length === 0) {
        todoList.innerHTML = "<p>هنوز کاری اضافه نکرده‌ای.</p>";
        return;
    }

    todos.forEach(todo => {
        const completedDays = getCompletedDays(todo);
        const progress = Math.min(
            (completedDays / todo.targetDays) * 100,
            100
        );

        const card = document.createElement("div");
        card.className = "todo-card";

        if (todo.completed) {
            card.classList.add("completed");
        }

        if (todo.completed) {
            card.innerHTML = `
                <div class="todo-header">
                    <h2>${escapeHTML(todo.title)}</h2>
                    <button class="delete-btn" data-id="${todo.id}">×</button>
                </div>

                <div class="progress-info">
                    <span>${completedDays} / ${todo.targetDays} روز موفق</span>
                    <span>100%</span>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%"></div>
                </div>

                <div class="completed-message">
                    ✓ عادت ایجاد شد
                </div>
            `;
        } else {
            const currentStatus = todo.days[todo.currentDay - 1];

            card.innerHTML = `
                <div class="todo-header">
                    <h2>${escapeHTML(todo.title)}</h2>
                    <button class="delete-btn" data-id="${todo.id}">×</button>
                </div>

                <div class="progress-info">
                    <span>${completedDays} / ${todo.targetDays} روز موفق</span>
                    <span>${Math.round(progress)}%</span>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>

                <div class="day-info">
                    روز ${todo.currentDay} از ${todo.targetDays}
                </div>

                <div class="status-buttons">
                    <button 
                        class="status-btn success ${currentStatus === "done" ? "selected" : ""}"
                        data-id="${todo.id}"
                        data-status="done">
                        ✓
                    </button>

                    <button 
                        class="status-btn failed ${currentStatus === "failed" ? "selected" : ""}"
                        data-id="${todo.id}"
                        data-status="failed">
                        ×
                    </button>
                </div>

                <button 
                    class="next-day-btn"
                    data-id="${todo.id}">
                    روز بعد →
                </button>
            `;
        }

        todoList.appendChild(card);
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => {
            deleteTodo(Number(button.dataset.id));
        });
    });

    document.querySelectorAll(".status-btn").forEach(button => {
        button.addEventListener("click", () => {
            setDayStatus(
                Number(button.dataset.id),
                button.dataset.status
            );
        });
    });

    document.querySelectorAll(".next-day-btn").forEach(button => {
        button.addEventListener("click", () => {
            nextDay(Number(button.dataset.id));
        });
    });
}

addTodoBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addTodo();
    }
});

daysInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addTodo();
    }
});

renderTodos();