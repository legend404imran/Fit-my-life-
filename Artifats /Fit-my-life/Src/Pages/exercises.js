import { exerciseLibrary, searchExercises } from '../utils/exercises-db.js';
import { getIcon } from '../utils/icons.js';
import { Modal } from '../components/modals.js';

export async function render(container) {
  container.innerHTML = `
    <div class="page-container pb-24">
      <h1 class="text-2xl font-bold mb-6">Exercise Library</h1>
      
      <div class="relative mb-6">
        <span class="absolute left-3 top-3 text-muted">${getIcon('search', 18)}</span>
        <input type="text" id="ex-search" placeholder="Search exercises..." class="pl-10" />
      </div>
      
      <div class="flex gap-2 overflow-x-auto pb-4 mb-2 filter-pills">
        <button class="px-4 py-1 rounded-full bg-blue text-white text-sm font-semibold whitespace-nowrap active" data-filter="All">All</button>
        ${['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map(f => `
          <button class="px-4 py-1 rounded-full bg-card border border-glass-border text-sm whitespace-nowrap" data-filter="${f}">${f}</button>
        `).join('')}
      </div>
      
      <div id="ex-list" class="grid gap-3"></div>
    </div>
  `;
  
  const listEl = container.querySelector('#ex-list');
  let currentFilter = 'All';
  let currentQuery = '';
  
  const renderList = () => {
    let list = searchExercises(currentQuery);
    
    if (currentFilter !== 'All') {
      // Map basic filter terms to db muscles
      if (currentFilter === 'Arms') {
        list = list.filter(e => e.muscle.includes('Bicep') || e.muscle.includes('Tricep'));
      } else if (currentFilter === 'Core') {
        list = list.filter(e => e.muscle === 'Abs');
      } else {
        list = list.filter(e => e.muscle === currentFilter || e.group === currentFilter);
      }
    }
    
    listEl.innerHTML = list.length === 0 ? 
      `<div class="text-center py-8 text-muted">No exercises found.</div>` :
      list.map(ex => `
      <div class="card p-4 flex justify-between items-center cursor-pointer ex-item" data-id="${ex.id}">
        <div>
          <h3 class="font-bold text-lg mb-1">${ex.name}</h3>
          <div class="flex gap-2 text-xs">
            <span class="bg-blue-glow text-blue px-2 py-0.5 rounded">${ex.muscle}</span>
            <span class="bg-card px-2 py-0.5 rounded border border-glass-border text-muted">${ex.equipment}</span>
          </div>
        </div>
        <div class="text-muted">${getIcon('chevronRight', 20)}</div>
      </div>
    `).join('');
    
    listEl.querySelectorAll('.ex-item').forEach(el => {
      el.addEventListener('click', () => {
        const ex = exerciseLibrary.find(e => e.id === el.dataset.id);
        Modal.open(ex.name, `
          <div class="flex flex-col gap-4">
            <div class="flex gap-2">
              <span class="badge bg-blue text-white px-2 py-1 rounded text-xs font-bold">${ex.muscle}</span>
              <span class="badge bg-card text-muted px-2 py-1 rounded border border-glass-border text-xs">${ex.equipment}</span>
              <span class="badge bg-card text-warning px-2 py-1 rounded border border-glass-border text-xs">${ex.difficulty}</span>
            </div>
            
            <div class="mt-2">
              <h4 class="font-bold mb-2">Instructions</h4>
              <p class="text-sm text-secondary leading-relaxed">
                Maintain proper form. Keep core tight and control the eccentric movement. 
                <br/><br/>
                <em>Note: A full version would include detailed step-by-step instructions and video illustrations.</em>
              </p>
            </div>
          </div>
        `);
      });
    });
  };
  
  // Bind events
  renderList();
  
  container.querySelector('#ex-search').addEventListener('input', (e) => {
    currentQuery = e.target.value;
    renderList();
  });
  
  container.querySelectorAll('.filter-pills button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.filter-pills button').forEach(b => {
        b.className = 'px-4 py-1 rounded-full bg-card border border-glass-border text-sm whitespace-nowrap';
      });
      e.target.className = 'px-4 py-1 rounded-full bg-blue text-white text-sm font-semibold whitespace-nowrap active';
      currentFilter = e.target.dataset.filter;
      renderList();
    });
  });
}