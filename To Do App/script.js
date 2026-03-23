/* ============================================================
   To-Do List App — Application Logic (Vanilla JavaScript)
   Features: Add, Edit, Delete, Complete, Filter, LocalStorage
   ============================================================ */

// ──────────────────────────────────────────────
// DOM References
// ──────────────────────────────────────────────
const taskInput       = document.getElementById('task-input');
const btnAdd          = document.getElementById('btn-add');
const validationMsg   = document.getElementById('validation-msg');
const taskListEl      = document.getElementById('task-list');
const filterBar       = document.querySelector('.filter-bar');
const btnClear        = document.getElementById('btn-clear');
const modalOverlay    = document.getElementById('modal-overlay');
const modalCancel     = document.getElementById('modal-cancel');
const modalDelete     = document.getElementById('modal-delete');

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
const STORAGE_KEY = 'todo-app-tasks';
let tasks         = [];          // Array of { id, text, createdAt, completed }
let currentFilter = 'all';       // 'all' | 'active' | 'completed'
let deleteTargetId = null;       // ID of the task pending deletion

// ──────────────────────────────────────────────
// LocalStorage Helpers
// ──────────────────────────────────────────────

/**
 * Load tasks from LocalStorage.
 * Returns an array of task objects (or empty array).
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save the given tasks array to LocalStorage.
 * @param {Array} tasks
 */
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ──────────────────────────────────────────────
// Rendering
// ──────────────────────────────────────────────

/**
 * Render the task list based on the current filter.
 * Uses innerHTML for simplicity; event delegation handles clicks.
 * @param {Array} tasks
 */
function renderTasks(tasks) {
  // Apply filter
  let filtered = tasks;
  if (currentFilter === 'active') {
    filtered = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filtered = tasks.filter(t => t.completed);
  }

  // Build HTML
  taskListEl.innerHTML = filtered.map(task => `
    <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark complete" />
      <span class="task-text">${escapeHTML(task.text)}</span>
      <div class="task-actions">
        <button class="btn-edit" data-action="edit" type="button">✏️ Edit</button>
        <button class="btn-delete" data-action="delete" type="button">🗑️ Del</button>
      </div>
    </li>
  `).join('');
}

/**
 * Simple HTML-escape to prevent XSS when rendering user input.
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ──────────────────────────────────────────────
// Task CRUD
// ──────────────────────────────────────────────

/**
 * Add a new task with the given text.
 * Validates, trims, saves, and re-renders.
 * @param {string} text
 */
function addTask(text) {
  const trimmed = text.trim();

  // Validation — show inline message
  if (!trimmed) {
    showValidation();
    return;
  }

  hideValidation();

  const newTask = {
    id: generateId(),
    text: trimmed,
    createdAt: Date.now(),
    completed: false,
  };

  tasks.push(newTask);
  saveTasks(tasks);
  renderTasks(tasks);

  // Reset input
  taskInput.value = '';
  taskInput.focus();
}

/**
 * Delete a task by its ID (called after modal confirm).
 * @param {string} id
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks(tasks);
}

/**
 * Switch a task row into edit mode.
 * Replaces the text and action buttons with an input + Save/Cancel.
 * @param {string} id
 */
function startEditTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const li = taskListEl.querySelector(`[data-id="${id}"]`);
  if (!li) return;

  // Replace inner content (keep checkbox)
  const checkbox = li.querySelector('.task-checkbox');
  li.innerHTML = '';
  li.appendChild(checkbox);

  // Edit input
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = task.text;
  input.setAttribute('aria-label', 'Edit task text');
  li.appendChild(input);

  // Save & Cancel buttons
  const actions = document.createElement('div');
  actions.className = 'task-actions';
  actions.innerHTML = `
    <button class="btn-save" data-action="save" type="button">💾 Save</button>
    <button class="btn-cancel" data-action="cancel" type="button">✖ Cancel</button>
  `;
  li.appendChild(actions);

  // Focus input and select text
  input.focus();
  input.select();

  // Allow pressing Enter to save, Escape to cancel
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveEditTask(id, input.value);
    } else if (e.key === 'Escape') {
      cancelEditTask(id);
    }
  });
}

/**
 * Save edited task text.
 * @param {string} id
 * @param {string} newText
 */
function saveEditTask(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    // Highlight the edit input briefly
    const li = taskListEl.querySelector(`[data-id="${id}"]`);
    const input = li?.querySelector('.edit-input');
    if (input) {
      input.style.borderColor = 'var(--clr-danger)';
      input.focus();
    }
    return;
  }

  const task = tasks.find(t => t.id === id);
  if (task) {
    task.text = trimmed;
    saveTasks(tasks);
  }
  renderTasks(tasks);
}

/**
 * Cancel editing — just re-render.
 * @param {string} _id — unused but kept for API consistency
 */
function cancelEditTask(_id) {
  renderTasks(tasks);
}

/**
 * Toggle completed status for a task.
 * @param {string} id
 */
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks(tasks);
    renderTasks(tasks);
  }
}

// ──────────────────────────────────────────────
// Filter & Clear
// ──────────────────────────────────────────────

/**
 * Set the active filter and re-render.
 * @param {'all'|'active'|'completed'} filter
 */
function setFilter(filter) {
  currentFilter = filter;

  // Update active class on filter buttons
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  renderTasks(tasks);
}

/**
 * Remove all completed tasks.
 */
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks(tasks);
  renderTasks(tasks);
}

// ──────────────────────────────────────────────
// Validation UI
// ──────────────────────────────────────────────

function showValidation() {
  validationMsg.classList.add('visible');
  taskInput.classList.add('input-error');
  taskInput.focus();
}

function hideValidation() {
  validationMsg.classList.remove('visible');
  taskInput.classList.remove('input-error');
}

// ──────────────────────────────────────────────
// Delete Modal
// ──────────────────────────────────────────────

function openDeleteModal(id) {
  deleteTargetId = id;
  modalOverlay.classList.add('open');
}

function closeDeleteModal() {
  deleteTargetId = null;
  modalOverlay.classList.remove('open');
}

modalCancel.addEventListener('click', closeDeleteModal);
modalDelete.addEventListener('click', () => {
  if (deleteTargetId) {
    deleteTask(deleteTargetId);
  }
  closeDeleteModal();
});

// Close modal on backdrop click
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeDeleteModal();
  }
});

// ──────────────────────────────────────────────
// Event Delegation on Task List
// ──────────────────────────────────────────────
taskListEl.addEventListener('click', (e) => {
  const li = e.target.closest('.task-item');
  if (!li) return;
  const id = li.dataset.id;

  // Checkbox toggle
  if (e.target.classList.contains('task-checkbox')) {
    toggleComplete(id);
    return;
  }

  // Action buttons
  const action = e.target.dataset.action;
  if (!action) return;

  switch (action) {
    case 'edit':
      startEditTask(id);
      break;
    case 'delete':
      openDeleteModal(id);
      break;
    case 'save': {
      const input = li.querySelector('.edit-input');
      if (input) saveEditTask(id, input.value);
      break;
    }
    case 'cancel':
      cancelEditTask(id);
      break;
  }
});

// ──────────────────────────────────────────────
// Add Task Events
// ──────────────────────────────────────────────
btnAdd.addEventListener('click', () => addTask(taskInput.value));

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTask(taskInput.value);
  }
});

// Hide validation on typing
taskInput.addEventListener('input', hideValidation);

// ──────────────────────────────────────────────
// Filter Bar Events
// ──────────────────────────────────────────────
filterBar.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-filter')) {
    setFilter(e.target.dataset.filter);
  }
});

btnClear.addEventListener('click', clearCompleted);

// ──────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────

/**
 * Generate a short unique ID.
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ──────────────────────────────────────────────
// Initialise on page load
// ──────────────────────────────────────────────
(function init() {
  tasks = loadTasks();
  renderTasks(tasks);
  taskInput.focus();
})();
