document.addEventListener("DOMContentLoaded", () => {
    const loginPage = document.getElementById("login-page");
    const adminDashboard = document.getElementById("admin-dashboard");
    const employeeDashboard = document.getElementById("employee-dashboard");

    const taskForm = document.getElementById("taskForm");
    const assignedTasksList = document.getElementById("assignedTasksList");
    const taskTable = document.getElementById("taskTable").getElementsByTagName('tbody')[0];
    const barChart = document.getElementById("barChart");
    const pieChart = document.getElementById("pieChart");

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Get current time in HH:MM:SS format
    const getCurrentTime = () => {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    };

    // Show tasks in the admin and employee dashboard
    const renderTasks = () => {
        assignedTasksList.innerHTML = "";
        taskTable.innerHTML = ""; // Clear the table for employee dashboard
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.textContent = `${task.employee} (Department: ${task.department}) - ${task.details} [Assigned on: ${task.date} at ${task.time}]`;
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteTask(index));
            li.appendChild(deleteButton);
            assignedTasksList.appendChild(li);

            // Populate the table for employee dashboard
            const row = taskTable.insertRow();
            row.insertCell(0).textContent = task.employee;
            row.insertCell(1).textContent = task.department;
            row.insertCell(2).textContent = task.details;
            row.insertCell(3).textContent = `${task.date} at ${task.time}`;

            const progressCell = row.insertCell(4);
            const progressInput = document.createElement("input");
            progressInput.type = "number";
            progressInput.value = task.progress;
            progressInput.min = 0;
            progressInput.max = 100;
            progressInput.addEventListener("change", () => updateTaskProgress(index, progressInput.value));
            progressCell.appendChild(progressInput);

            const deleteCell = row.insertCell(5);
            const deleteTaskBtn = document.createElement("button");
            deleteTaskBtn.textContent = "Delete";
            deleteTaskBtn.addEventListener("click", () => deleteTask(index));
            deleteCell.appendChild(deleteTaskBtn);
        });
    };

    // Add Task
    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const employee = document.getElementById("employeeName").value;
        const department = document.getElementById("department").value;
        const date = document.getElementById("assignmentDate").value;
        const details = document.getElementById("taskDetails").value;
        const time = getCurrentTime();

        tasks.push({ employee, department, date, time, details, progress: 0 });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();

        // Clear form
        taskForm.reset();
    });

    // Update Task Progress
    const updateTaskProgress = (index, progress) => {
        tasks[index].progress = progress;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderCharts();
    };

    // Delete Task
    const deleteTask = (index) => {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    };

    // Render charts for employees
    const renderCharts = () => {
        const taskData = tasks.map(task => task.progress); // Task progress (0-100)
        const taskLabels = tasks.map(task => task.employee); // Employee labels

        new Chart(barChart, {
            type: 'bar',
            data: {
                labels: taskLabels,
                datasets: [{
                    label: 'Task Progress (%)',
                    data: taskData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        new Chart(pieChart, {
            type: 'pie',
            data: {
                labels: taskLabels,
                datasets: [{
                    label: 'Task Distribution',
                    data: taskData,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            }
        });
    };

    // Handle login
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const role = document.getElementById("role").value;
        loginPage.classList.add("hidden");

        if (role === "admin") {
            adminDashboard.classList.remove("hidden");
            renderTasks();
        } else if (role === "employee") {
            employeeDashboard.classList.remove("hidden");
            renderTasks(); // Render assigned tasks in table
            renderCharts();
        }
    });

    // Handle logout
    const logout = document.getElementById("logout");
    logout.addEventListener("click", () => {
        adminDashboard.classList.add("hidden");
        employeeDashboard.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });
});
