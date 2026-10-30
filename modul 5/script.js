document.addEventListener("DOMContentLoaded", () => {
    const todoForm = document.querySelector("#todoForm");
    const taskInput = document.querySelector("#taskInput");
    const inputError = document.querySelector("#inputError");
    const todoList = document.querySelector("#todoList");
    const taskCounter = document.querySelector("#taskCounter");
    const clearCompletedBtn = document.querySelector("#clearCompletedBtn");

    const getTasks = () => JSON.parse(localStorage.getItem("todo_tasks")) || [];
    const saveTasks = (tasks) => localStorage.setItem("todo_tasks", JSON.stringify(tasks));
    const removeTasks = (tasks) => localStorage.removeItem('todo_tasks');

    const updateCounter = (tasks) => {
        const total = tasks.length;
        const selesai = tasks.filter((t) => t.completed).length;
        const belum = total - selesai;
        taskCounter.textContent = `Total: ${total} Tugas | Selesai: ${selesai} | Belum Selesai: ${belum}`;
    };
    const renderTasks = () => {
        const tasks = getTasks();
        todoList.innerHTML = "";
        updateCounter(tasks);

        if (tasks.length === 0) {
            todoList.innerHTML = "<p style='text-align:center; color:#64748b; font-size:13px; padding:10px;'>Belum ada tugas tersimpan.</p>";
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <span class="todo-text">${task.text}</span>
                <div class="todo-actions">
                    <button class="action-btn complete-btn" data-index="${index}">
                        ${task.completed ? 'Batal' : 'Selesai'}
                    </button>
                    <button class="action-btn delete-btn" data-index="${index}">Hapus</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    };

    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();

        if (taskText.length < 3) {
            taskInput.classList.add("error");
            inputError.style.display = "block";
            return;
        }

        taskInput.classList.remove("error");
        inputError.style.display = "none";

        const tasks = getTasks();

        if (tasks.length >= 5) {
            alert("Maksimal hanya 5 tugas! Hapus tugas lain terlebih dahulu.");
            return;
        }

        tasks.push({ text: taskText, completed: false });
        saveTasks(tasks);

        taskInput.value = "";
        renderTasks();
    });

    todoList.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        if (index === undefined) return;

        const tasks = getTasks();

        if (e.target.classList.contains("complete-btn")) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks(tasks);
            renderTasks();
        } else if (e.target.classList.contains("delete-btn")) {
            if (confirm('Apakah Anda yakin mau hapus tugas ini?')) {
                tasks.splice(index, 1);
                saveTasks(tasks);
                renderTasks();
            }
        }
    });

    clearCompletedBtn.addEventListener("click", () => {
        const tasks = getTasks().filter((t) => !t.completed);
        saveTasks(tasks);
        renderTasks();
    });

    renderTasks();
});