import { DB } from '../db.js';
import { getIcon } from '../utils/icons.js';
import { Toast } from '../components/toast.js';

let currentDate = new Date().toISOString().split('T')[0];

const moods = [
  { val: 1, icon: '😢', label: 'Sad', color: '#ef4444' },
  { val: 2, icon: '😰', label: 'Stressed', color: '#f59e0b' },
  { val: 3, icon: '😴', label: 'Tired', color: '#94a3b8' },
  { val: 4, icon: '😐', label: 'Normal', color: '#818cf8' },
  { val: 5, icon: '😊', label: 'Happy', color: '#22c55e' },
  { val: 6, icon: '⚡', label: 'Energetic', color: '#eab308' },
  { val: 7, icon: '💪', label: 'Motivated', color: '#3b82f6' }
];

export async function render(container) {
  const log = await DB.get('moods', currentDate) || { mood: 4, energy: 5, notes: '' };
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2" style="color: #f472b6">
          ${getIcon('smile', 24)} Mood
        </h1>
        <input type="date" id="mood-date" value="${currentDate}" class="bg-card text-sm py-1 px-2 w-auto border-none" />
      </div>
      
      <div class="card mb-6">
        <h2 class="text-lg font-bold mb-6 text-center">How are you feeling?</h2>
        
        <div class="flex flex-wrap justify-center gap-3 mb-8" id="mood-selector">
          ${moods.map(m => `
            <button class="mood-btn flex flex-col items-center gap-2 p-3 rounded-xl border border-glass-border transition-all ${log.mood === m.val ? 'bg-card border-blue shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-110' : 'opacity-60 hover:opacity-100'}" data-val="${m.val}">
              <span class="text-3xl">${m.icon}</span>
              <span class="text-[10px] font-semibold">${m.label}</span>
            </button>
          `).join('')}
        </div>
        <input type="hidden" id="selected-mood" value="${log.mood}" />
        
        <div class="mb-8">
          <div class="flex justify-between items-center mb-2">
            <label class="form-label m-0">Energy Level</label>
            <span class="text-blue font-bold" id="energy-val">${log.energy}/10</span>
          </div>
          <input type="range" id="energy-slider" min="1" max="10" value="${log.energy}" class="w-full accent-blue" />
        </div>
        
        <div class="mb-6">
          <label class="form-label">Journal Note (Optional)</label>
          <textarea id="mood-notes" rows="3" placeholder="What's on your mind?">${log.notes || ''}</textarea>
        </div>
        
        <button id="save-mood" class="btn btn-primary w-full">Save Entry</button>
      </div>
      
      <div class="card">
        <h3 class="text-sm font-bold text-muted mb-4">MOOD TIMELINE</h3>
        <div id="mood-timeline" class="flex flex-col gap-3">
          <!-- Populated by JS -->
        </div>
      </div>
    </div>
  `;

  // Events
  container.querySelector('#mood-date').addEventListener('change', (e) => {
    currentDate = e.target.value;
    render(container);
  });

  const slider = container.querySelector('#energy-slider');
  const energyVal = container.querySelector('#energy-val');
  slider.addEventListener('input', (e) => {
    energyVal.innerText = `${e.target.value}/10`;
  });

  container.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = parseInt(e.currentTarget.dataset.val);
      container.querySelector('#selected-mood').value = val;
      
      container.querySelectorAll('.mood-btn').forEach(b => {
        const bVal = parseInt(b.dataset.val);
        b.className = `mood-btn flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${bVal === val ? 'bg-card border-blue shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-110' : 'border-glass-border opacity-60 hover:opacity-100'}`;
      });
    });
  });

  container.querySelector('#save-mood').addEventListener('click', async () => {
    await DB.put('moods', {
      date: currentDate,
      mood: parseInt(container.querySelector('#selected-mood').value),
      energy: parseInt(container.querySelector('#energy-slider').value),
      notes: container.querySelector('#mood-notes').value,
      timestamp: Date.now()
    });
    
    Toast.show('Mood saved');
    renderTimeline();
  });

  async function renderTimeline() {
    const all = await DB.getAll('moods');
    all.sort((a,b) => b.date.localeCompare(a.date));
    const recent = all.slice(0, 5);
    
    const tl = container.querySelector('#mood-timeline');
    if (recent.length === 0) {
      tl.innerHTML = '<div class="text-sm text-muted text-center py-2">No past entries.</div>';
      return;
    }
    
    tl.innerHTML = recent.map(r => {
      const moodDef = moods.find(m => m.val === r.mood) || moods[3];
      return `
        <div class="flex items-center gap-4 bg-secondary p-3 rounded-xl border border-glass-border">
          <div class="text-3xl">${moodDef.icon}</div>
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <span class="font-bold text-sm" style="color: ${moodDef.color}">${moodDef.label}</span>
              <span class="text-xs text-muted">${new Date(r.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
            </div>
            <div class="text-xs text-secondary mt-1">Energy: ${r.energy}/10</div>
            ${r.notes ? `<div class="text-xs italic mt-1 bg-card p-2 rounded truncate max-w-[200px] border border-glass-border">"${r.notes}"</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
  
  renderTimeline();
}