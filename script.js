
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const priorityInput = document.getElementById("priorityInput");

const totalCount = document.getElementById("totalCount");
const doneCount = document.getElementById("doneCount");
const leftCount = document.getElementById("leftCount");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");

const emptyState = document.getElementById("emptyState");
const footerCount = document.getElementById("footerCount");
const bunny = document.getElementById("bunny");
const bunnyMessage = document.getElementById("bunnyMessage");
const garden = document.getElementById("garden");
const gardenMessage = document.getElementById("gardenMessage");

const themeBtn = document.getElementById("themeBtn");
const quoteBtn = document.getElementById("quoteBtn");
const clearCompletedBtn = document.getElementById("clearCompleted");
const resetBtn = document.getElementById("resetBtn");
const toast = document.getElementById("toast");
const confettiLayer = document.getElementById("confetti");

let tasks = loadTasks();
let currentFilter = "all";
let toastTimer;
let confettiTimer;

const bunnyMessages = [
    "You've got this, cutie! 🎀",
    "One tiny step at a time! 🐰",
    "I'm so proud of you! 💗",
    "Look at you being amazing! ✨",
    "Don't forget to be kind to yourself. 🌷",
    "Your effort counts, bestie! 💌"
];

const quotes = [
    "You're allowed to grow slowly. 🌱",
    "Done is better than perfect. 🎀",
    "Small steps are still progress. 🌷",
    "You deserve breaks, too. ☁️",
    "You can start again whenever you need. 💗",
    "Your pace is a perfectly good pace. 🐰"
];

const stickerCollection = ["🎀", "🐰", "🌷", "💖"];

function loadTasks() {
    try {
        const saved = JSON.parse(localStorage.getItem("petalPopTasks"));
        if (!Array.isArray(saved)) return [];

        return saved.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        ).map(task => ({
            id: task.id,
            text: task.text.slice(0, 120),
            completed: task.completed,
            priority: ["low", "medium", "high"].includes(task.priority)
                ? task.priority
                : "medium",
            createdAt: typeof task.createdAt === "string"
                ? task.createdAt
                : new Date().toISOString()
        }));
    } catch {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem("petalPopTasks", JSON.stringify(tasks));
        return true;
    } catch {
        showToast("Couldn't save tasks in this browser 💗");
        return false;
    }
}

function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function addTask(text, priority) {
    const task = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString() + Math.random().toString(36).slice(2),
        text,
        completed: false,
        priority,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    currentFilter = "all";
    updateFilterButtons();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();

    bunny.textContent = "🐰";
    bunnyMessage.textContent = "A new little goal! You got this!";
    showToast("A new little task has arrived! 🎀");
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        showToast("Write a little task first, bestie! 💌");
        taskInput.focus();
        return;
    }

    addTask(text, priorityInput.value);
});

function toggleTask(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
        bunny.textContent = "🐰";
        bunnyMessage.textContent = "YOU DID IT, BESTIE!!";
        showToast("Little win unlocked! You're amazing! 💗");
        celebrate();
    } else {
        bunnyMessage.textContent = "That's okay! Keep going gently. 🌷";
        showToast("Task moved back to your to-do list ♡");
    }

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    showToast("Task sent away with love 💌");
}

function createTaskElement(task) {
    const item = document.createElement("article");
    item.className = "task-item" + (task.completed ? " completed" : "");

    const checkButton = document.createElement("button");
    checkButton.className = "task-check";
    checkButton.type = "button";
    checkButton.textContent = task.completed ? "✓" : "";
    checkButton.setAttribute(
        "aria-label",
        task.completed ? "Mark task incomplete" : "Complete task"
    );
    checkButton.addEventListener("click", () => toggleTask(task.id));

    const content = document.createElement("div");
    content.className = "task-content";

    const taskText = document.createElement("div");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const priority = document.createElement("span");
    priority.className = "priority-badge priority-" + task.priority;

    const priorityLabels = {
        low: "🌱 Low priority",
        medium: "💗 Medium priority",
        high: "🔥 High priority"
    };

    priority.textContent = priorityLabels[task.priority] || priorityLabels.medium;

    const date = document.createElement("span");
    date.className = "task-date";

    const createdDate = new Date(task.createdAt);
    date.textContent = Number.isNaN(createdDate.getTime())
        ? "♡ Little goal"
        : "♡ " + createdDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric"
        });

    meta.append(priority, date);
    content.append(taskText, meta);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete " + task.text);
    deleteButton.title = "Delete task";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkButton, content, deleteButton);

    return item;
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    visibleTasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });

    emptyState.hidden = visibleTasks.length > 0;
    taskList.hidden = visibleTasks.length === 0;

    if (visibleTasks.length === 0) {
        const messages = {
            all: "Add a task above and make today a little magical.",
            active: "All caught up! Time for a tiny happy dance! 💃",
            completed: "Your wins will appear here when you finish tasks."
        };

        emptyState.querySelector("p").textContent = messages[currentFilter];
    }

    updateStats();
    updateGarden();
    updateRewards();
}

function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const remaining = tasks.length - completed;
    const percentage = tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0;

    totalCount.textContent = tasks.length;
    doneCount.textContent = completed;
    leftCount.textContent = remaining;

    progressBar.style.width = percentage + "%";
    progressLabel.textContent = percentage + "%";

    footerCount.textContent = remaining === 0 && tasks.length > 0
        ? "You did it all, superstar! 🎉"
        : `${remaining} little task${remaining === 1 ? "" : "s"} to go ♡`;
}

function updateGarden() {
    const completed = tasks.filter(task => task.completed).length;

    const flowers = completed >= 8
        ? ["🌸", "🌷", "🌻", "🌼", "🌹", "🌺"]
        : completed >= 5
        ? ["🌷", "🌸", "🌼", "🌷", "🌸", "🌼"]
        : completed >= 2
        ? ["🌱", "🌷", "🌱", "🌼", "🌱", "🌷"]
        : completed >= 1
        ? ["🌱", "🌷", "🌱", "🌱", "🌱", "🌱"]
        : ["🌱", "🌱", "🌱", "🌱", "🌱", "🌱"];

    garden.replaceChildren();

    flowers.forEach(flower => {
        const span = document.createElement("span");
        span.textContent = flower;
        garden.appendChild(span);
    });

    if (completed >= 8) {
        gardenMessage.textContent = "A whole dreamy garden! You are blooming! 🌸";
    } else if (completed >= 5) {
        gardenMessage.textContent = "Your garden is blossoming beautifully! 🌷";
    } else if (completed >= 2) {
        gardenMessage.textContent = "Look! Your little garden is growing! 🌱";
    } else if (completed === 1) {
        gardenMessage.textContent = "Your first flower has bloomed! 🌷";
    } else {
        gardenMessage.textContent = "Every little step helps your garden grow ♡";
    }
}

function updateRewards() {
    const completed = tasks.filter(task => task.completed).length;
    const unlocked = Math.min(
        stickerCollection.length,
        Math.floor(completed / 2)
    );

    const stickers = document.getElementById("stickers");
    stickers.replaceChildren();

    stickerCollection.forEach((sticker, index) => {
        const span = document.createElement("span");
        const isUnlocked = index < unlocked;

        span.textContent = isUnlocked ? sticker : "🔒";
        span.title = isUnlocked ? "Sticker unlocked!" : "Complete more tasks to unlock";
        stickers.appendChild(span);
    });

    const rewardMessage = document.getElementById("rewardMessage");

    if (unlocked === stickerCollection.length) {
        rewardMessage.textContent = "All stickers unlocked! You're a star! ✨";
    } else {
        const nextTarget = (unlocked + 1) * 2;
        rewardMessage.textContent =
            `${Math.max(0, nextTarget - completed)} more win(s) for your next sticker ♡`;
    }
}

function updateFilterButtons() {
    document.querySelectorAll(".filter-btn").forEach(button => {
        const isActive = button.dataset.filter === currentFilter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        updateFilterButtons();
        renderTasks();
    });
});

function celebrate() {
    const pieces = ["💗", "🎀", "✨", "🌸", "💕", "⭐", "🌷"];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 55; i++) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.textContent = randomItem(pieces);
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.animationDelay = Math.random() * 0.7 + "s";
        piece.style.fontSize = (12 + Math.random() * 14) + "px";
        fragment.appendChild(piece);
    }

    confettiLayer.replaceChildren(fragment);

    clearTimeout(confettiTimer);
    confettiTimer = setTimeout(() => {
        confettiLayer.replaceChildren();
    }, 3300);
}

function loadTheme() {
    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("petalPopTheme") || "light";
    } catch {
        // Keep the default light theme if storage is unavailable.
    }

    applyTheme(savedTheme === "dark");
}

function applyTheme(isDark) {
    document.body.classList.toggle("dark", isDark);
    themeBtn.textContent = isDark ? "☀️" : "🌙";
    themeBtn.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    try {
        localStorage.setItem("petalPopTheme", isDark ? "dark" : "light");
    } catch {
        // The theme still works for the current page.
    }
}

themeBtn.addEventListener("click", () => {
    applyTheme(!document.body.classList.contains("dark"));
    showToast(
        document.body.classList.contains("dark")
            ? "Cozy moonlight mode activated 🌙"
            : "Back to our pink paradise! 🎀"
    );
});

quoteBtn.addEventListener("click", () => {
    const note = document.querySelector(".note-card h3");
    let nextQuote = randomItem(quotes);

    while (quotes.length > 1 && nextQuote === note.textContent) {
        nextQuote = randomItem(quotes);
    }

    note.textContent = nextQuote;
    showToast("A little love note, just for you 💌");
});

clearCompletedBtn.addEventListener("click", () => {
    const completedCount = tasks.filter(task => task.completed).length;

    if (completedCount === 0) {
        showToast("No completed tasks to clear just yet ♡");
        return;
    }

    if (!confirm(`Remove your ${completedCount} completed task(s)?`)) {
        return;
    }

    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    showToast("Your completed list has been tidied up 🌷");
});

resetBtn.addEventListener("click", () => {
    if (tasks.length === 0) {
        showToast("Your task list is already empty ♡");
        return;
    }

    if (!confirm("Reset ALL tasks? This cannot be undone.")) {
        return;
    }

    tasks = [];
    saveTasks();
    renderTasks();
    showToast("A fresh little start! 🎀");
});

function updateDate() {
    document.getElementById("todayDate").textContent =
        "♡ " + new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
}

loadTheme();
updateDate();
updateFilterButtons();
renderTasks();
 
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch((error) => {
        console.error("PetalPop offline setup failed:", error);
      });
  });
}