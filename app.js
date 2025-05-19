let columns = JSON.parse(localStorage.getItem('columns')) || [
  { 
    id: 1,
    title: 'Сделать',
    tasks: [
      {
        id: Date.now(),
        text: 'Пример задачи',
        date: new Date().toISOString().split('T')[0]
      }
    ]
  },
  { 
    id: 2,
    title: 'В процессе',
    tasks: []
  },
  { 
    id: 3,
    title: 'Готово',
    tasks: []
  }
];
function saveToLocalStorage() {
  localStorage.setItem('columns', JSON.stringify(columns));
}
function renderColumns() {
  const columnsContainer = document.getElementById('columns');
  columnsContainer.innerHTML = '';

  columns.forEach(column => {
    const columnElement = document.createElement('div');
    columnElement.className = 'column';
    columnElement.dataset.id = column.id;
    columnElement.innerHTML = `
      <div class="column-header">
        <div class="column-title" contenteditable="true">${column.title}</div>
        <button class="delete-column">×</button>
      </div>
      <form class="task-form">
        <input type="text" class="task-input" placeholder="Новая задача" required>
        <input type="date" class="task-date">
        <button type="submit">+</button>
      </form>
      <ul class="task-list"></ul>
    `;
    flatpickr(columnElement.querySelector('.task-date'), {
      dateFormat: "Y-m-d",
      locale: "ru"
    });
    columnsContainer.appendChild(columnElement);
    renderTasks(column.id);
    const taskList = columnElement.querySelector('.task-list');
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('dragleave', handleDragLeave);
    taskList.addEventListener('drop', handleDrop);
  });
}
function renderTasks(columnId) {
  const column = columns.find(c => c.id == columnId);
  const taskList = document.querySelector(`.column[data-id="${columnId}"] .task-list`);
  taskList.innerHTML = '';
  column.tasks.forEach(task => {
    const taskElement = document.createElement('li');
    taskElement.dataset.id = task.id;
    taskElement.draggable = true;
    taskElement.innerHTML = `
      <div class="task-content">
        <span class="task-text">${task.text}</span>
        <span class="task-date">${formatDate(task.date)}</span>
      </div>
      <div class="task-actions">
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">×</button>
      </div>
    `;
    taskElement.addEventListener('dragstart', handleDragStart);
    taskList.appendChild(taskElement);
  });
}
function formatDate(dateString) {
  if (!dateString) return 'Без срока';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
document.getElementById('add-column').addEventListener('click', () => {
  const newColumn = {
    id: Date.now(),
    title: 'Новый столбец',
    tasks: []
  };
  columns.push(newColumn);
  saveToLocalStorage();
  renderColumns();
});
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-column')) {
    const columnId = parseInt(e.target.closest('.column').dataset.id);
    columns = columns.filter(c => c.id !== columnId);
    saveToLocalStorage();
    renderColumns();
  }
  if (e.target.classList.contains('delete-btn')) {
    const taskElement = e.target.closest('li');
    const columnId = parseInt(taskElement.closest('.column').dataset.id);
    const taskId = parseInt(taskElement.dataset.id);
    const column = columns.find(c => c.id === columnId);
    column.tasks = column.tasks.filter(t => t.id !== taskId);
    saveToLocalStorage();
    renderColumns();
  }
  if (e.target.classList.contains('edit-btn')) {
    const taskElement = e.target.closest('li');
    const taskId = parseInt(taskElement.dataset.id);
    const columnId = parseInt(taskElement.closest('.column').dataset.id);
    const column = columns.find(c => c.id === columnId);
    const task = column.tasks.find(t => t.id === taskId);
    document.getElementById('edit-text').value = task.text;
    document.getElementById('edit-date').value = task.date || '';
    document.getElementById('edit-task-id').value = taskId;
    document.getElementById('edit-column-id').value = columnId;
    document.getElementById('edit-modal').style.display = 'block';
  }
  if (e.target.id === 'cancel-edit') {
    document.getElementById('edit-modal').style.display = 'none';
  }
});
document.addEventListener('submit', (e) => {
  if (e.target.classList.contains('task-form')) {
    e.preventDefault();
    const input = e.target.querySelector('.task-input');
    const dateInput = e.target.querySelector('.task-date');
    const taskText = input.value.trim();
    if (taskText) {
      const columnId = parseInt(e.target.closest('.column').dataset.id);
      const column = columns.find(c => c.id === columnId);
      column.tasks.push({
        id: Date.now(),
        text: taskText,
        date: dateInput.value || null
      });
      saveToLocalStorage();
      renderTasks(columnId);
      input.value = '';
      dateInput.value = '';
    }
  }
  if (e.target.id === 'edit-form') {
    e.preventDefault();
    const taskId = parseInt(document.getElementById('edit-task-id').value);
    const columnId = parseInt(document.getElementById('edit-column-id').value);
    const newText = document.getElementById('edit-text').value.trim();
    const newDate = document.getElementById('edit-date').value;
    const column = columns.find(c => c.id === columnId);
    const task = column.tasks.find(t => t.id === taskId);
    if (task) {
      task.text = newText;
      task.date = newDate || null;
      saveToLocalStorage();
      renderColumns();
    }
    document.getElementById('edit-modal').style.display = 'none';
  }
});
function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', JSON.stringify({
    taskId: parseInt(e.target.dataset.id),
    sourceColumnId: parseInt(e.target.closest('.column').dataset.id)
  }));
  e.target.classList.add('dragging');
}
function handleDragOver(e) {
  e.preventDefault();
  if (e.target.classList.contains('task-list') || e.target.closest('.task-list')) {
    const taskList = e.target.classList.contains('task-list') 
      ? e.target 
      : e.target.closest('.task-list');
    taskList.classList.add('drag-over');
  }
}
function handleDragLeave(e) {
  if (e.target.classList.contains('task-list')) {
    e.target.classList.remove('drag-over');
  }
}
function handleDrop(e) {
  e.preventDefault();
  const taskList = e.target.closest('.task-list');
  taskList.classList.remove('drag-over');

  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
  const { taskId, sourceColumnId } = data;
  const targetColumnId = parseInt(taskList.closest('.column').dataset.id);

  moveTask(sourceColumnId, targetColumnId, taskId);
}
function moveTask(sourceColumnId, targetColumnId, taskId) {
  const sourceColumn = columns.find(c => c.id === sourceColumnId);
  const targetColumn = columns.find(c => c.id === targetColumnId);
  const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;
  const [task] = sourceColumn.tasks.splice(taskIndex, 1);
  targetColumn.tasks.push(task);
  saveToLocalStorage();
  renderColumns();
}
document.addEventListener('DOMContentLoaded', () => {
  renderColumns();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { scope: './' })
      .then(() => console.log('SW зарегистрирован'))
      .catch(err => console.log('Ошибка SW:', err));
  }
});