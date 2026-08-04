import { DB } from '../db.js';
import { getIcon } from '../utils/icons.js';
import { exerciseLibrary } from '../utils/exercises-db.js';
import { Modal } from '../components/modals.js';
import { Toast } from '../components/toast.js';

let currentDate = new Date().toISOString().split('T')[0];

export async function render(container) {
  const workouts = await DB.getByIndex('workouts', 'date', currentDate);
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Workouts</h1>
        <input type="date" id="workout-date" value="${currentDate}" class="bg-card text-sm py-1 px-2 w-auto" />
      </div>
      
      ${workouts.length === 0 ? `
        <div class="card mb-6 p-6 flex flex-col items-center text-center">
          <div class="text-blue mb-4 opacity-50">${getIcon('dumbbell', 48)}</div>
          <h2 class="text-xl font-bold mb-2">Ready to lift?</h2>
          <p class="text-sm text-muted mb-6">No workout logged for this day yet.</p>
          <button id="start-empty-workout" class="btn btn-primary w-full">Start Empty Workout</button>
        </div>
        
        <h3 class="text-lg font-bold mb-4">Templates</h3>
        <div class="grid grid-cols-2 gap-4">
          <button class="template-btn card flex flex-col items-center gap-2 p-4" data-template="Push">
            <div class="text-warning">${getIcon('flame', 24)}</div>
            <span class="font-bold text-sm">Push Day</span>
          </button>
          <button class="template-btn card flex flex-col items-center gap-2 p-4" data-template="Pull">
            <div class="text-blue">${getIcon('activity', 24)}</div>
            <span class="font-bold text-sm">Pull Day</span>
          </button>
          <button class="template-btn card flex flex-col items-center gap-2 p-4" data-template="Legs">
            <div class="text-green">${getIcon('zap', 24)}</div>
            <span class="font-bold text-sm">Leg Day</span>
          </button>
          <button class="template-btn card flex flex-col items-center gap-2 p-4" data-template="Cardio">
            <div class="text-danger">${getIcon('heart', 24)}</div>
            <span class="font-bold text-sm">Cardio</span>
          </button>
        </div>
      ` : `
        <div class="flex flex-col gap-4">
          ${workouts.map(w => `
            <div class="card">
              <div class="flex justify-between items-center border-b border-glass-border pb-3 mb-3">
                <h2 class="font-bold text-lg">${w.name || 'Workout'}</h2>
                <div class="text-xs bg-blue-glow text-blue px-2 py-1 rounded">
                  ${w.duration ? `${w.duration}m` : 'Completed'}
                </div>
              </div>
              <div class="text-sm text-secondary mb-4">
                ${w.exercises ? w.exercises.length : 0} exercises performed
              </div>
              <div class="flex gap-2">
                <button class="btn btn-glass flex-1 btn-sm view-workout" data-id="${w.id}">View</button>
                <button class="btn btn-danger btn-sm delete-workout" data-id="${w.id}">${getIcon('trash', 16)}</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  // Events
  container.querySelector('#workout-date').addEventListener('change', (e) => {
    currentDate = e.target.value;
    render(container);
  });

  const startBtn = container.querySelector('#start-empty-workout');
  if (startBtn) {
    startBtn.addEventListener('click', () => startWorkout(container, 'New Workout', []));
  }

  container.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.currentTarget.dataset.template;
      startWorkout(container, `${type} Day`, getTemplateExercises(type));
    });
  });

  container.querySelectorAll('.delete-workout').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Delete this workout?')) {
        await DB.delete('workouts', e.currentTarget.dataset.id);
        Toast.show('Workout deleted');
        render(container);
      }
    });
  });
}

function getTemplateExercises(type) {
  // basic mock for templates
  if (type === 'Push') return [{ name: 'Bench Press', sets: [{reps:10, weight:60, done:false}, {reps:10, weight:60, done:false}] }];
  return [];
}

function startWorkout(container, name, initialExercises) {
  // Active Workout Mode Full Screen Overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-primary z-[200] overflow-y-auto flex flex-col fade-in';
  overlay.style.background = 'var(--bg-primary)';
  
  let exercises = [...initialExercises];
  let startTime = Date.now();
  let timerInterval;

  const renderActive = () => {
    overlay.innerHTML = `
      <div class="sticky top-0 bg-primary/90 backdrop-blur border-b border-glass-border p-4 flex justify-between items-center z-10">
        <div>
          <h2 class="font-bold text-lg">${name}</h2>
          <div id="workout-timer" class="text-sm text-blue font-mono">00:00</div>
        </div>
        <button id="finish-workout" class="btn btn-green btn-sm">Finish</button>
      </div>
      
      <div class="p-4 flex-1 pb-24">
        ${exercises.map((ex, exIdx) => `
          <div class="card mb-4">
            <h3 class="font-bold text-blue mb-3 flex justify-between">
              ${ex.name}
              <button class="text-muted del-ex" data-idx="${exIdx}">${getIcon('trash', 16)}</button>
            </h3>
            
            <div class="flex flex-col gap-2">
              <div class="grid grid-cols-12 text-xs font-bold text-muted text-center mb-1">
                <div class="col-span-2">Set</div>
                <div class="col-span-4">kg</div>
                <div class="col-span-4">Reps</div>
                <div class="col-span-2"></div>
              </div>
              
              ${(ex.sets || []).map((set, setIdx) => `
                <div class="grid grid-cols-12 gap-2 items-center text-center ${set.done ? 'opacity-50' : ''}">
                  <div class="col-span-2 font-bold">${setIdx + 1}</div>
                  <div class="col-span-4">
                    <input type="number" class="w-full text-center bg-secondary border-none px-1 set-val" data-ex="${exIdx}" data-set="${setIdx}" data-field="weight" value="${set.weight || ''}" />
                  </div>
                  <div class="col-span-4">
                    <input type="number" class="w-full text-center bg-secondary border-none px-1 set-val" data-ex="${exIdx}" data-set="${setIdx}" data-field="reps" value="${set.reps || ''}" />
                  </div>
                  <div class="col-span-2 flex justify-center">
                    <button class="toggle-set w-8 h-8 rounded bg-${set.done ? 'green' : 'card'} flex items-center justify-center text-white transition-colors" data-ex="${exIdx}" data-set="${setIdx}">
                      ${getIcon('checkCircle', 16)}
                    </button>
                  </div>
                </div>
              `).join('')}
              
              <button class="add-set btn btn-glass btn-sm mt-2 w-full" data-ex="${exIdx}">+ Add Set</button>
            </div>
          </div>
        `).join('')}
        
        <button id="add-exercise" class="btn btn-primary w-full border border-blue-glow bg-transparent text-blue hover:bg-blue hover:text-white">+ Add Exercise</button>
      </div>
    `;

    // Bind active events
    overlay.querySelectorAll('.add-set').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.dataset.ex;
        if (!exercises[idx].sets) exercises[idx].sets = [];
        const lastSet = exercises[idx].sets[exercises[idx].sets.length - 1] || { weight: 0, reps: 0 };
        exercises[idx].sets.push({ weight: lastSet.weight, reps: lastSet.reps, done: false });
        renderActive();
      });
    });

    overlay.querySelectorAll('.toggle-set').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const exIdx = e.currentTarget.dataset.ex;
        const setIdx = e.currentTarget.dataset.set;
        exercises[exIdx].sets[setIdx].done = !exercises[exIdx].sets[setIdx].done;
        renderActive();
      });
    });

    overlay.querySelectorAll('.set-val').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const exIdx = e.target.dataset.ex;
        const setIdx = e.target.dataset.set;
        const field = e.target.dataset.field;
        exercises[exIdx].sets[setIdx][field] = parseFloat(e.target.value) || 0;
      });
    });

    overlay.querySelectorAll('.del-ex').forEach(btn => {
      btn.addEventListener('click', (e) => {
        exercises.splice(e.currentTarget.dataset.idx, 1);
        renderActive();
      });
    });

    overlay.querySelector('#add-exercise').addEventListener('click', () => {
      Modal.open('Select Exercise', `
        <div class="flex flex-col gap-2 max-h-80 overflow-y-auto">
          ${exerciseLibrary.map(libEx => `
            <div class="card p-3 flex justify-between items-center cursor-pointer hover-elevate" onclick="window.addEx('${libEx.name}')">
              <div>
                <div class="font-bold">${libEx.name}</div>
                <div class="text-xs text-muted">${libEx.muscle} • ${libEx.equipment}</div>
              </div>
              <div class="text-blue">${getIcon('plus', 20)}</div>
            </div>
          `).join('')}
        </div>
      `);
      
      window.addEx = (name) => {
        exercises.push({ name, sets: [{reps:10, weight:0, done:false}] });
        Modal.close();
        renderActive();
      };
    });

    overlay.querySelector('#finish-workout').addEventListener('click', async () => {
      clearInterval(timerInterval);
      const durationMins = Math.round((Date.now() - startTime) / 60000);
      
      const workout = {
        id: 'wk_' + Date.now(),
        date: currentDate,
        name,
        duration: durationMins,
        exercises,
        timestamp: Date.now()
      };
      
      await DB.put('workouts', workout);
      Toast.show('Workout saved! Great job! 💪');
      overlay.remove();
      render(container);
    });
  };

  renderActive();
  document.body.appendChild(overlay);
  
  // Timer
  const timerEl = overlay.querySelector('#workout-timer');
  timerInterval = setInterval(() => {
    if (!document.body.contains(overlay)) { clearInterval(timerInterval); return; }
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    const t = overlay.querySelector('#workout-timer');
    if (t) t.innerText = `${m}:${s}`;
  }, 1000);
}