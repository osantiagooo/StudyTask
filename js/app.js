import{loadTasks,saveTasks,MAX_TASKS}from'./storage.js';import{createTaskCard,escapeHtml}from'./ui.js';import{initRouter}from'./router.js';import{initAccessibility}from'./accessibility.js';let tasks=[],editingId=null,currentFilter='all';const appContent=document.getElementById('app-content'),taskModalEl=document.getElementById('taskModal'),taskModal=new bootstrap.Modal(taskModalEl),taskForm=document.getElementById('taskForm'),btnSaveTask=document.getElementById('btnSaveTask'),modalTitle=document.getElementById('taskModalLabel'),fieldId=document.getElementById('taskId'),fieldTitle=document.getElementById('taskTitle'),fieldDescription=document.getElementById('taskDescription'),fieldDeadline=document.getElementById('taskDeadline'),fieldSubject=document.getElementById('taskSubject'),fieldPriority=document.getElementById('taskPriority');document.addEventListener('DOMContentLoaded',()=>{tasks=loadTasks();renderHome();initRouter(handleRouteChanged);setupModalEvents();initAccessibility()});function handleRouteChanged(e){switch(e){case'/':renderHome();break;case'/tarefas':renderTasksPage();break;case'/materias':renderMateriasPage();break;case'/sobre':renderSobrePage();break;default:renderHome()}}function renderHome(){const e=tasks.filter(e=>!e.completed).length,t=tasks.filter(e=>e.completed).length;appContent.innerHTML=`
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
            <h5 class="card-title text-warning">${e}</h5>
            <p class="card-text mb-0">Pendentes</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center h-100">
          <div class="card-body">
            <h5 class="card-title text-success">${t}</h5>
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
  `;document.getElementById('btnAddTaskHome').addEventListener('click',openCreateModal);renderTaskList(document.getElementById('recent-tasks'),tasks.slice(0,5))}function renderTasksPage(){appContent.innerHTML=`
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
  `;document.getElementById('btnAddTask').addEventListener('click',openCreateModal);document.querySelectorAll('.filter-btn').forEach(e=>{e.addEventListener('click',()=>{document.querySelectorAll('.filter-btn').forEach(e=>e.classList.remove('active'));e.classList.add('active');currentFilter=e.dataset.filter;renderFilteredTasks()})});renderFilteredTasks()}function renderMateriasPage(){const e=[...new Set(tasks.map(e=>e.subject).filter(Boolean))];appContent.innerHTML=`
    <h2 class="mb-3">Matérias</h2>
    <hr>
    <p class="text-muted">Matérias extraídas automaticamente das suas tarefas.</p>
    ${0===e.length?`
          <div class="empty-state">
            <p>Nenhuma matéria cadastrada ainda.<br>Adicione o campo "Matéria" ao criar uma tarefa.</p>
          </div>
        `:`
          <ul class="list-group">
            ${e.map(e=>`
              <li class="list-group-item d-flex justify-content-between align-items-center">
                ${escapeHtml(e)}
                <span class="badge bg-primary rounded-pill">${tasks.filter(t=>t.subject===e).length}</span>
              </li>
            `).join('')}
          </ul>
        `}
  `}function renderSobrePage(){appContent.innerHTML=`
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
  `}function renderFilteredTasks(){let e=tasks;'pending'===currentFilter&&(e=tasks.filter(e=>!e.completed));'completed'===currentFilter&&(e=tasks.filter(e=>e.completed));e=[...e].sort((e,t)=>e.completed!==t.completed?e.completed?1:-1:new Date(e.deadline)-new Date(t.deadline));const t=document.getElementById('taskCounter');t&&(t.textContent=`${e.length} de ${tasks.length} tarefa(s) • Máximo: ${MAX_TASKS}`);renderTaskList(document.getElementById('task-list'),e)}function renderTaskList(e,t){if(!e)return;if(0===t.length){e.innerHTML=`
      <div class="empty-state">
        <p class="mb-2">Nenhuma tarefa encontrada.</p>
        <button type="button" class="btn btn-outline-primary btn-sm" id="btnEmptyAdd">Criar primeira tarefa</button>
      </div>
    `;const t=document.getElementById('btnEmptyAdd');return void(t&&t.addEventListener('click',openCreateModal))}e.innerHTML=t.map(e=>createTaskCard(e)).join('');e.querySelectorAll('[data-action]').forEach(e=>{e.addEventListener('click',()=>{const t=e.closest('[data-id]').dataset.id,n=e.dataset.action;handleTaskAction(n,t)})})}function setupModalEvents(){btnSaveTask.addEventListener('click',saveTask);taskModalEl.addEventListener('hidden.bs.modal',()=>{taskForm.classList.remove('was-validated');taskForm.reset();editingId=null})}function openCreateModal(){if(tasks.length>=MAX_TASKS)return void alert(`Limite de ${MAX_TASKS} tarefas atingido. Exclua alguma para criar uma nova.`);editingId=null;modalTitle.textContent='Nova Tarefa';fieldId.value='';fieldTitle.value='';fieldDescription.value='';fieldDeadline.value='';fieldSubject.value='';fieldPriority.value='media';const e=new Date().toISOString().split('T')[0];fieldDeadline.min=e;fieldDeadline.value=e;taskForm.classList.remove('was-validated');taskModal.show();setTimeout(()=>fieldTitle.focus(),300)}function openEditModal(e){const t=tasks.find(t=>t.id===e);t&&(editingId=e,modalTitle.textContent='Editar Tarefa',fieldId.value=t.id,fieldTitle.value=t.title,fieldDescription.value=t.description||'',fieldDeadline.value=t.deadline,fieldSubject.value=t.subject||'',fieldPriority.value=t.priority||'media',fieldDeadline.min='',taskForm.classList.remove('was-validated'),taskModal.show(),setTimeout(()=>fieldTitle.focus(),300))}function saveTask(){if(!taskForm.checkValidity())return void taskForm.classList.add('was-validated');const e=fieldTitle.value.trim(),t=fieldDescription.value.trim(),n=fieldDeadline.value,a=fieldSubject.value.trim(),i=fieldPriority.value;if(!e||!n)return void taskForm.classList.add('was-validated');if(editingId){const s=tasks.findIndex(e=>e.id===editingId);-1!==s&&(tasks[s]={...tasks[s],title:e,description:t,deadline:n,subject:a,priority:i,updatedAt:new Date().toISOString()})}else{if(tasks.length>=MAX_TASKS)return void alert(`Limite de ${MAX_TASKS} tarefas atingido.`);const s={id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),title:e,description:t,deadline:n,subject:a,priority:i,completed:!1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};tasks.unshift(s)}saveTasks(tasks);taskModal.hide();refreshCurrentView()}function handleTaskAction(e,t){switch(e){case'edit':openEditModal(t);break;case'complete':toggleComplete(t,!0);break;case'reopen':toggleComplete(t,!1);break;case'delete':deleteTask(t)}}function toggleComplete(e,t){const n=tasks.find(t=>t.id===e);n&&(n.completed=t,n.updatedAt=new Date().toISOString(),saveTasks(tasks),refreshCurrentView())}function deleteTask(e){confirm('Tem certeza que deseja excluir esta tarefa?')&&(tasks=tasks.filter(t=>t.id!==e),saveTasks(tasks),refreshCurrentView())}function refreshCurrentView(){const e=document.querySelector('#main-nav .nav-link.active'),t=e?e.getAttribute('data-route'):'/';'/tarefas'===t?renderFilteredTasks():'/'===t?renderHome():'/materias'===t?renderMateriasPage():'/sobre'===t&&renderSobrePage()}
