const MAX_TASKS = 30;
const STORAGE_KEY = 'studytask_tasks';

// Estado
let tasks = [];
let editingId = null;
let currentFilter = 'all'; // all | pending | completed

// Elementos DOM
const appContent = document.getElementById('app-content');
const taskModalEl = document.getElementById('taskModal');
const taskModal = new bootstrap.Modal(taskModalEl);
const taskForm = document.getElementById('taskForm');
const btnSaveTask = document.getElementById('btnSaveTask');
const modalTitle = document.getElementById('taskModalLabel');

// Campos do formulário
const fieldId = document.getElementById('taskId');
const fieldTitle = document.getElementById('taskTitle');
const fieldDescription = document.getElementById('taskDescription');
const fieldDeadline = document.getElementById('taskDeadline');
const fieldSubject = document.getElementById('taskSubject');
const fieldPriority = document.getElementById('taskPriority');

// ==================== Inicialização ====================
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  renderHome();
  setupNav();
  setupModalEvents();
});

// ==================== Persistência ====================
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(tasks)) tasks = [];
  } catch (e) {
    console.error('Erro ao carregar tarefas:', e);
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ==================== Navegação simples ====================
function setupNav() {
  document.querySelectorAll('#main-nav [data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.getAttribute('data-route');

      // Atualiza classe active
      document.querySelectorAll('#main-nav .nav-link').forEach(l => {
        l.classList.remove('active');
        l.classList.add('text-dark');
      });
      link.classList.add('active');
      link.classList.remove('text-dark');

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
    });
  });
}

// ==================== Páginas ====================
function renderHome() {
  const pending = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;

  appContent.innerHTML = `
    <h2 class="mb-3">Bem-vindo(a) ao StudyTask</h2>
    <hr>
    <p class="lead">Organize seus estudos e tarefas em um só lugar.</p>

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

  document.getElementById('btnAddTaskHome').addEventListener('click', openCreateModal);
  renderTaskList(document.getElementById('recent-tasks'), tasks.slice(0, 5));
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
        <button type="button" class="btn btn-outline-secondary filter-btn active" data-filter="all">Todas</button>
        <button type="button" class="btn btn-outline-secondary filter-btn" data-filter="pending">Pendentes</button>
        <button type="button" class="btn btn-outline-secondary filter-btn" data-filter="completed">Concluídas</button>
      </div>
      <span class="task-counter text-muted" id="taskCounter"></span>
    </div>

    <div id="task-list"></div>
  `;

  document.getElementById('btnAddTask').addEventListener('click', openCreateModal);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderFilteredTasks();
    });
  });

  renderFilteredTasks();
}

function renderMateriasPage() {
  const subjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];

  appContent.innerHTML = `
    <h2 class="mb-3">Matérias</h2>
    <hr>
    <p class="text-muted">Matérias extraídas automaticamente das suas tarefas.</p>
    ${subjects.length === 0
      ? '<div class="empty-state"><p>Nenhuma matéria cadastrada ainda.<br>Adicione o campo "Matéria" ao criar uma tarefa.</p></div>'
      : `<ul class="list-group">${subjects.map(s => `<li class="list-group-item d-flex justify-content-between align-items-center">
          ${escapeHtml(s)}
          <span class="badge bg-primary rounded-pill">${tasks.filter(t => t.subject === s).length}</span>
        </li>`).join('')}</ul>`
    }
  `;
}

function renderSobrePage() {
  appContent.innerHTML = `
    <h2 class="mb-3">Sobre o StudyTask</h2>
    <hr>
    <p>Plataforma simples para organização de estudos e tarefas.</p>
    <ul>
      <li>Crie até <strong>${MAX_TASKS}</strong> tarefas</li>
      <li>Defina título, descrição, prazo, matéria e prioridade</li>
      <li>Edite, conclua ou exclua a qualquer momento</li>
      <li>Dados salvos localmente no seu navegador (localStorage)</li>
    </ul>
    <p class="text-muted small">© 2026 StudyTask</p>
  `;
}

// ==================== Lista de tarefas ====================
function renderFilteredTasks() {
  let filtered = tasks;
  if (currentFilter === 'pending') filtered = tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);

  // Ordena: não concluídas primeiro, depois por prazo
  filtered = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  const counter = document.getElementById('taskCounter');
  if (counter) {
    counter.textContent = `${filtered.length} de ${tasks.length} tarefa(s) • Máximo: ${MAX_TASKS}`;
  }

  renderTaskList(document.getElementById('task-list'), filtered);
}

function renderTaskList(container, list) {
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="mb-2">Nenhuma tarefa encontrada.</p>
        <button type="button" class="btn btn-outline-primary btn-sm" id="btnEmptyAdd">Criar primeira tarefa</button>
      </div>
    `;
    const btn = document.getElementById('btnEmptyAdd');
    if (btn) btn.addEventListener('click', openCreateModal);
    return;
  }

  container.innerHTML = list.map(task => createTaskCard(task)).join('');

  // Eventos dos botões de cada card
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.closest('[data-id]').dataset.id;
      const action = btn.dataset.action;
      handleTaskAction(action, id);
    });
  });
}

function createTaskCard(task) {
  const deadlineInfo = getDeadlineBadge(task.deadline, task.completed);
  const priorityClass = `priority-${task.priority || 'media'}`;
  const completedClass = task.completed ? 'completed' : '';

  return `
    <div class="card task-card mb-3 ${priorityClass} ${completedClass}" data-id="${task.id}">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1">
            <h5 class="card-title task-title mb-1">${escapeHtml(task.title)}</h5>
            ${task.description ? `<p class="card-text small mb-2">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta d-flex flex-wrap gap-2 align-items-center">
              ${deadlineInfo}
              ${task.subject ? `<span class="badge bg-secondary">${escapeHtml(task.subject)}</span>` : ''}
              <span class="badge bg-light text-dark border">${capitalize(task.priority || 'media')}</span>
            </div>
          </div>
          <div class="btn-group-vertical btn-group-sm">
            ${!task.completed
              ? `<button type="button" class="btn btn-outline-success btn-action" data-action="complete" title="Marcar como concluída">✓</button>`
              : `<button type="button" class="btn btn-outline-secondary btn-action" data-action="reopen" title="Reabrir">↺</button>`
            }
            <button type="button" class="btn btn-outline-primary btn-action" data-action="edit" title="Editar">✎</button>
            <button type="button" class="btn btn-outline-danger btn-action" data-action="delete" title="Excluir">🗑</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getDeadlineBadge(deadline, completed) {
  if (completed) {
    return `<span class="badge bg-secondary badge-deadline">Concluída</span>`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline + 'T00:00:00');
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  let label = formatDate(deadline);
  let cls = 'bg-primary';

  if (diffDays < 0) {
    label = `Atrasada (${Math.abs(diffDays)}d)`;
    cls = 'overdue';
  } else if (diffDays === 0) {
    label = 'Hoje!';
    cls = 'today';
  } else if (diffDays <= 3) {
    label = `${diffDays} dia(s)`;
    cls = 'soon';
  }

  return `<span class="badge badge-deadline ${cls}">${label}</span>`;
}

// ==================== Modal ====================
function setupModalEvents() {
  btnSaveTask.addEventListener('click', saveTask);

  // Limpa validação ao fechar
  taskModalEl.addEventListener('hidden.bs.modal', () => {
    taskForm.classList.remove('was-validated');
    taskForm.reset();
    editingId = null;
  });
}

function openCreateModal() {
  if (tasks.length >= MAX_TASKS) {
    alert(`Limite de ${MAX_TASKS} tarefas atingido. Exclua alguma para criar uma nova.`);
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

  // Define data mínima como hoje
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

  fieldDeadline.min = ''; // permite manter prazo passado se já existir
  taskForm.classList.remove('was-validated');
  taskModal.show();
  setTimeout(() => fieldTitle.focus(), 300);
}

function saveTask() {
  // Validação nativa
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
    // Atualiza
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
    // Cria nova
    if (tasks.length >= MAX_TASKS) {
      alert(`Limite de ${MAX_TASKS} tarefas atingido.`);
      return;
    }
    const newTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
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

  saveTasks();
  taskModal.hide();

  // Atualiza a view atual
  refreshCurrentView();
}

// ==================== Ações ====================
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
  saveTasks();
  refreshCurrentView();
}

function deleteTask(id) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  refreshCurrentView();
}

function refreshCurrentView() {
  const active = document.querySelector('#main-nav .nav-link.active');
  const route = active ? active.getAttribute('data-route') : '/';

  if (route === '/tarefas') {
    renderFilteredTasks();
  } else if (route === '/') {
    renderHome();
  } else if (route === '/materias') {
    renderMateriasPage();
  }
}

// ==================== Utilitários ====================
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}