// Responsabilidade exclusiva de salvar, carregar e persistir os dados.
const STORAGE_KEY = 'studytask_tasks';
export const MAX_TASKS = 30;

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const tasks = raw ? JSON.parse(raw) : [];
    return Array.isArray(tasks) ? tasks : [];
  } catch (e) {
    console.error('Erro ao carregar tarefas:', e);
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}