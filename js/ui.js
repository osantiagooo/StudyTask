// Responsabilidade exclusiva de renderizar HTML, sanitizar dados e manipular elementos de UI.
// Funções Utilitárias de UI
export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export function getDeadlineBadge(deadline, completed) {
  if (completed) return `<span class="badge bg-secondary badge-deadline">Concluída</span>`;

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

export function createTaskCard(task) {
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
