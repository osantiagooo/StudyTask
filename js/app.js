// Coordena o estado global, importa os módulos independentes e liga as ações de UI aos dados.
import { loadTasks, saveTasks, MAX_TASKS } from './storage.js';
import { createTaskCard, escapeHtml } from './ui.js';
import { initRouter } from './router.js';
import { initAccessibility } from './accessibility.js';

// Estado da Aplicação
let tasks = [];
let editingId = null;
let currentFilter = 'all';

// Elementos DOM principais
const appContent = document.getElementById('app-content');
const taskModalEl = document.getElementById('taskModal');
const taskModal = new bootstrap.Modal(taskModalEl);
const taskForm = document.getElementById('taskForm');
const btnSaveTask = document.getElementById('btnSaveTask');
const modalTitle = document.getElementById('taskModalLabel');

const fieldId = document.getElementById('taskId');
const fieldTitle = document.getElementById('taskTitle');
const fieldDescription = document.getElementById('taskDescription');
const fieldDeadline = document.getElementById('taskDeadline');
const fieldSubject = document.getElementById('taskSubject');
const fieldPriority = document.getElementById('taskPriority');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  tasks = loadTasks();
  renderHome();
  initRouter(handleRouteChanged);
  setupModalEvents();
  initAccessibility();
});

function handleRouteChanged(route) {
  switch (route) {
    case '/':
      renderHome();
      break;

    case '/tarefas':
      renderTasksPage();
      break;

    case '/materias':
      renderMateriasPage();
      break;

    case '/sobre':
      renderSobrePage();
      break;

    default:
      renderHome();
  }
}

// Renderização das Páginas
function renderHome() {
  const pending = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;

  appContent.innerHTML = `
    <h2 class="mb-3">Bem-vindo(a) ao StudyTask</h2>
    <hr>

    <p class="lead">
      Organize seus estudos e tarefas em um só lugar.
    </p>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card text-center h-100">
          <div class="card-body">
            <h5 class="card-title text-primary">${tasks.length}</h5>
            <p class="card-text mb-0">Total de tarefas</p>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card text-center h-100">
          <div class="card-body">
            <h5 class="card-title text-warning">${pending}</h5>
            <p class="card-text mb-0">Pendentes</p>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card text-center h-100">
          <div class="card-body">
            <h5 class="card-title text-success">${completed}</h5>
            <p class="card-text mb-0">Concluídas</p>
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="btn btn-primary btn-lg" id="btnAddTaskHome">
      <span class="me-1">+</span> Adicionar nova tarefa
    </button>

    <div class="mt-4">
      <h4>Últimas tarefas</h4>
      <div id="recent-tasks"></div>
    </div>
  `;

  document
    .getElementById('btnAddTaskHome')
    .addEventListener('click', openCreateModal);

  renderTaskList(
    document.getElementById('recent-tasks'),
    tasks.slice(0, 5)
  );
}

function renderTasksPage() {
  appContent.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h2 class="mb-0">Minhas Tarefas</h2>

      <button type="button" class="btn btn-primary" id="btnAddTask">
        <span class="me-1">+</span> Adicionar nova tarefa
      </button>
    </div>

    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="btn-group filter-bar" role="group">
        <button
          type="button"
          class="btn btn-outline-secondary filter-btn active"
          data-filter="all"
        >
          Todas
        </button>

        <button
          type="button"
          class="btn btn-outline-secondary filter-btn"
          data-filter="pending"
        >
          Pendentes
        </button>

        <button
          type="button"
          class="btn btn-outline-secondary filter-btn"
          data-filter="completed"
        >
          Concluídas
        </button>
      </div>

      <span class="task-counter text-muted" id="taskCounter"></span>
    </div>

    <div id="task-list"></div>
  `;

  document
    .getElementById('btnAddTask')
    .addEventListener('click', openCreateModal);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('.filter-btn')
        .forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      currentFilter = btn.dataset.filter;

      renderFilteredTasks();
    });
  });

  renderFilteredTasks();
}

function renderMateriasPage() {
  const subjects = [
    ...new Set(
      tasks
        .map(t => t.subject)
        .filter(Boolean)
    )
  ];

  appContent.innerHTML = `
    <h2 class="mb-3">Matérias</h2>
    <hr>

    <p class="text-muted">
      Matérias extraídas automaticamente das suas tarefas.
    </p>

    ${
      subjects.length === 0
        ? `
          <div class="empty-state">
            <p>
              Nenhuma matéria cadastrada ainda.<br>
              Adicione o campo "Matéria" ao criar uma tarefa.
            </p>
          </div>
        `
        : `
          <ul class="list-group">
            ${subjects.map(subject => `
              <li class="list-group-item d-flex justify-content-between align-items-center">
                ${escapeHtml(subject)}
                <span class="badge bg-primary rounded-pill">
                  ${tasks.filter(t => t.subject === subject).length}
                </span>
              </li>
            `).join('')}
          </ul>
        `
    }
  `;
}

function renderSobrePage() {
  appContent.innerHTML = `
    <h2 class="mb-3">Sobre o StudyTask</h2>
    <hr>

    <p>
      Plataforma simples para organização de estudos e tarefas.
    </p>

    <ul>
      <li>Crie até <strong>${MAX_TASKS}</strong> tarefas</li>
      <li>Defina título, descrição, prazo, matéria e prioridade</li>
      <li>Edite, conclua ou exclua a qualquer momento</li>
      <li>Dados salvos localmente no seu navegador (localStorage)</li>
    </ul>

    <p class="text-muted small">
      © 2026 StudyTask
    </p>
  `;
}

// Manipulação de Tarefas
function renderFilteredTasks() {
  let filtered = tasks;

  if (currentFilter === 'pending') {
    filtered = tasks.filter(t => !t.completed);
  }

  if (currentFilter === 'completed') {
    filtered = tasks.filter(t => t.completed);
  }

  filtered = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    return new Date(a.deadline) - new Date(b.deadline);
  });

  const counter = document.getElementById('taskCounter');

  if (counter) {
    counter.textContent =
      `${filtered.length} de ${tasks.length} tarefa(s) • Máximo: ${MAX_TASKS}`;
  }

  renderTaskList(
    document.getElementById('task-list'),
    filtered
  );
}

function renderTaskList(container, list) {
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="mb-2">Nenhuma tarefa encontrada.</p>

        <button
          type="button"
          class="btn btn-outline-primary btn-sm"
          id="btnEmptyAdd"
        >
          Criar primeira tarefa
        </button>
      </div>
    `;

    const btn = document.getElementById('btnEmptyAdd');

    if (btn) {
      btn.addEventListener('click', openCreateModal);
    }

    return;
  }

  container.innerHTML = list
    .map(task => createTaskCard(task))
    .join('');

  container
    .querySelectorAll('[data-action]')
    .forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('[data-id]').dataset.id;
        const action = btn.dataset.action;

        handleTaskAction(action, id);
      });
    });
}

// Gerenciamento de Modal e Eventos
function setupModalEvents() {
  btnSaveTask.addEventListener('click', saveTask);

  taskModalEl.addEventListener('hidden.bs.modal', () => {
    taskForm.classList.remove('was-validated');
    taskForm.reset();
    editingId = null;
  });
}

function openCreateModal() {
  if (tasks.length >= MAX_TASKS) {
    alert(
      `Limite de ${MAX_TASKS} tarefas atingido. Exclua alguma para criar uma nova.`
    );

    return;
  }

  editingId = null;

  modalTitle.textContent = 'Nova Tarefa';

  fieldId.value = '';
  fieldTitle.value = '';
  fieldDescription.value = '';
  fieldDeadline.value = '';
  fieldSubject.value = '';
  fieldPriority.value = 'media';

  const today = new Date().toISOString().split('T')[0];

  fieldDeadline.min = today;
  fieldDeadline.value = today;

  taskForm.classList.remove('was-validated');

  taskModal.show();

  setTimeout(() => fieldTitle.focus(), 300);
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);

  if (!task) return;

  editingId = id;

  modalTitle.textContent = 'Editar Tarefa';

  fieldId.value = task.id;
  fieldTitle.value = task.title;
  fieldDescription.value = task.description || '';
  fieldDeadline.value = task.deadline;
  fieldSubject.value = task.subject || '';
  fieldPriority.value = task.priority || 'media';

  fieldDeadline.min = '';

  taskForm.classList.remove('was-validated');

  taskModal.show();

  setTimeout(() => fieldTitle.focus(), 300);
}

function saveTask() {
  if (!taskForm.checkValidity()) {
    taskForm.classList.add('was-validated');
    return;
  }

  const title = fieldTitle.value.trim();
  const description = fieldDescription.value.trim();
  const deadline = fieldDeadline.value;
  const subject = fieldSubject.value.trim();
  const priority = fieldPriority.value;

  if (!title || !deadline) {
    taskForm.classList.add('was-validated');
    return;
  }

  if (editingId) {
    const idx = tasks.findIndex(t => t.id === editingId);

    if (idx !== -1) {
      tasks[idx] = {
        ...tasks[idx],
        title,
        description,
        deadline,
        subject,
        priority,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    if (tasks.length >= MAX_TASKS) {
      alert(`Limite de ${MAX_TASKS} tarefas atingido.`);
      return;
    }

    const newTask = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) +
          Math.random().toString(36).slice(2),

      title,
      description,
      deadline,
      subject,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
  }

  saveTasks(tasks);

  taskModal.hide();

  refreshCurrentView();
}

function handleTaskAction(action, id) {
  switch (action) {
    case 'edit':
      openEditModal(id);
      break;

    case 'complete':
      toggleComplete(id, true);
      break;

    case 'reopen':
      toggleComplete(id, false);
      break;

    case 'delete':
      deleteTask(id);
      break;
  }
}

function toggleComplete(id, completed) {
  const task = tasks.find(t => t.id === id);

  if (!task) return;

  task.completed = completed;
  task.updatedAt = new Date().toISOString();

  saveTasks(tasks);

  refreshCurrentView();
}

function deleteTask(id) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
    return;
  }

  tasks = tasks.filter(t => t.id !== id);

  saveTasks(tasks);

  refreshCurrentView();
}

function refreshCurrentView() {
  const active = document.querySelector(
    '#main-nav .nav-link.active'
  );

  const route = active
    ? active.getAttribute('data-route')
    : '/';

  if (route === '/tarefas') {
    renderFilteredTasks();
  } else if (route === '/') {
    renderHome();
  } else if (route === '/materias') {
    renderMateriasPage();
  } else if (route === '/sobre') {
    renderSobrePage();
  }
}