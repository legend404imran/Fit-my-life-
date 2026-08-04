import { DB } from '../db.js';
import { getIcon } from '../utils/icons.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modals.js';

let currentDate = new Date().toISOString().split('T')[0];

export async function render(container) {
  const habits = await DB.getAll('habits');
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2 text-green">
          ${getIcon('checkCircle', 24)} Habits
        </h1>
        <div class="flex items-center gap-2">
          <input type="date" id="habit-date" value="${currentDate}" class="bg-card text-sm py-1 px-2 w-auto border-none" />
          <button id="add-habit-btn" class="bg-card p-1.5 rounded text-blue">${getIcon('plus', 20)}</button>
        </div>
      </div>
      
      ${habits.length === 0 ? `
        <div class="empty-state card border-dashed">
          ${getIcon('award', 48)}
          <h2 class="text-lg font-bold mb-2">Build Good Habits</h2>
          <p class="text-sm text-muted mb-4">Start tracking daily routines like reading, meditating, or stretching.</p>
          <button class="btn btn-primary btn-sm trigger-add-habit">Create Habit</button>
        </div>
      ` : `
        <div class="flex flex-col gap-3">
          ${habits.map(habit => {
            const isDone = habit.completions && habit.completions.includes(currentDate);
            return `
              <div class="card p-4 flex justify-between items-center transition-all ${isDone ? 'border-green opacity-80' : ''}">
                <div class="flex items-center gap-4">
                  <button class="toggle-habit w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${isDone ? 'border-green bg-green text-white' : 'border-glass-border text-transparent'}" data-id="${habit.id}">
                    ${getIcon('checkCircle', 20)}
                  </button>
                  <div>
                    <h3 class="font-bold ${isDone ? 'text-muted line-through' : ''}">${habit.name}</h3>
                    <div class="text-xs text-secondary flex items-center gap-1">
                      ${getIcon('flame', 12)} ${habit.streak || 0} streak
                    </div>
                  </div>
                </div>
                <button class="edit-habit text-muted p-2" data-id="${habit.id}">${getIcon('settings', 16)}</button>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  // Events
  container.querySelector('#habit-date').addEventListener('change', (e) => {
    currentDate = e.target.value;
    render(container);
  });

  const addBtns = container.querySelectorAll('#add-habit-btn, .trigger-add-habit');
  addBtns.forEach(btn => btn.addEventListener('click', () => openHabitModal(null, container)));

  container.querySelectorAll('.toggle-habit').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const habit = habits.find(h => h.id === id);
      if (!habit.completions) habit.completions = [];
      
      const idx = habit.completions.indexOf(currentDate);
      if (idx > -1) {
        habit.completions.splice(idx, 1);
        habit.streak = Math.max(0, (habit.streak || 1) - 1);
      } else {
        habit.completions.push(currentDate);
        habit.streak = (habit.streak || 0) + 1;
        
        // Success animation logic
        e.currentTarget.style.transform = 'scale(1.2)';
        setTimeout(() => e.currentTarget.style.transform = 'scale(1)', 200);
      }
      
      await DB.put('habits', habit);
      render(container);
    });
  });

  container.querySelectorAll('.edit-habit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const habit = habits.find(h => h.id === id);
      openHabitModal(habit, container);
    });
  });
}

function openHabitModal(habit, container) {
  const isEdit = !!habit;
  
  Modal.open(isEdit ? 'Edit Habit' : 'New Habit', `
    <form id="habit-form" class="flex flex-col gap-4">
      <div>
        <label class="form-label">Habit Name</label>
        <input type="text" id="h-name" value="${habit ? habit.name : ''}" required placeholder="e.g. Read 10 pages" />
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Category</label>
          <select id="h-cat">
            <option value="health">Health</option>
            <option value="mind">Mind</option>
            <option value="productivity">Productivity</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      ${isEdit ? `<button type="button" id="h-delete" class="text-danger text-sm font-bold text-left mt-2">Delete Habit</button>` : ''}
      
      <button type="submit" class="btn btn-primary w-full mt-4">Save</button>
    </form>
  `);
  
  if (isEdit) {
    document.getElementById('h-cat').value = habit.category || 'other';
    document.getElementById('h-delete').addEventListener('click', async () => {
      if (confirm('Delete this habit and all history?')) {
        await DB.delete('habits', habit.id);
        Modal.close();
        Toast.show('Habit deleted');
        render(container);
      }
    });
  }

  document.getElementById('habit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('h-name').value;
    const category = document.getElementById('h-cat').value;
    
    const newHabit = isEdit ? habit : {
      id: 'h_' + Date.now(),
      created: Date.now(),
      completions: [],
      streak: 0
    };
    
    newHabit.name = name;
    newHabit.category = category;
    
    await DB.put('habits', newHabit);
    Modal.close();
    Toast.show('Saved');
    render(container);
  });
}