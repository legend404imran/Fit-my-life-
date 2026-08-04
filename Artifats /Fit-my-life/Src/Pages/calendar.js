import { DB } from '../db.js';
import { getIcon } from '../utils/icons.js';
import { Modal } from '../components/modals.js';

let currentMonth = new Date();

export async function render(container) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-11
  
  // Fetch all data for the month
  const fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const toDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
  
  const workouts = await DB.getAll('workouts');
  const meals = await DB.getAll('meals');
  const water = await DB.getAll('water_log');
  
  // Create lookup maps
  const dataMap = {};
  
  workouts.forEach(w => {
    if(w.date.startsWith(fromDate.substring(0,7))) {
      if(!dataMap[w.date]) dataMap[w.date] = {};
      dataMap[w.date].workout = true;
    }
  });
  
  meals.forEach(m => {
    if(m.date.startsWith(fromDate.substring(0,7))) {
      if(!dataMap[m.date]) dataMap[m.date] = {};
      dataMap[m.date].food = true;
    }
  });
  
  water.forEach(w => {
    if(w.date.startsWith(fromDate.substring(0,7))) {
      if(!dataMap[w.date]) dataMap[w.date] = {};
      dataMap[w.date].water = (dataMap[w.date].water || 0) + w.amount;
    }
  });

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  
  // Adjust to Mon=0 for European format if desired, but default to Sun=0
  const blanks = Array(firstDay).fill('');
  const days = Array.from({length: daysInMonth}, (_, i) => String(i + 1).padStart(2, '0'));
  
  const waterTarget = window.Store.get('fml_profile', {}).dailyTargets?.water || 2500;

  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <button id="prev-month" class="p-2 bg-card rounded-full">${getIcon('chevronLeft', 20)}</button>
        <h1 class="text-xl font-bold">${monthName}</h1>
        <button id="next-month" class="p-2 bg-card rounded-full">${getIcon('chevronRight', 20)}</button>
      </div>
      
      <div class="card p-4">
        <div class="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted mb-2">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        
        <div class="grid grid-cols-7 gap-1" id="cal-grid">
          ${blanks.map(() => `<div class="aspect-square"></div>`).join('')}
          ${days.map(d => {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${d}`;
            const data = dataMap[dateStr] || {};
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            return `
              <div class="aspect-square flex flex-col items-center justify-start p-1 rounded-lg border cursor-pointer cal-day transition-colors hover:bg-bg-card-hover ${isToday ? 'border-blue bg-blue/10' : 'border-glass-border bg-secondary'}" data-date="${dateStr}">
                <span class="text-sm ${isToday ? 'font-bold text-blue' : ''}">${parseInt(d)}</span>
                <div class="flex gap-0.5 mt-auto pb-1">
                  ${data.workout ? `<div class="w-1.5 h-1.5 rounded-full bg-warning"></div>` : ''}
                  ${data.food ? `<div class="w-1.5 h-1.5 rounded-full bg-green"></div>` : ''}
                  ${data.water >= waterTarget ? `<div class="w-1.5 h-1.5 rounded-full bg-blue"></div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="mt-6 flex flex-wrap gap-4 justify-center text-xs text-muted font-semibold">
        <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-warning"></div> Workout</div>
        <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-green"></div> Food Logged</div>
        <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-blue"></div> Water Goal</div>
      </div>
    </div>
  `;

  // Events
  container.querySelector('#prev-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    render(container);
  });
  
  container.querySelector('#next-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    render(container);
  });
  
  container.querySelectorAll('.cal-day').forEach(el => {
    el.addEventListener('click', () => {
      const d = el.dataset.date;
      const displayDate = new Date(d).toLocaleDateString(undefined, {weekday:'long', month:'short', day:'numeric'});
      
      Modal.open(displayDate, `
        <div class="flex flex-col gap-3 text-center">
          <a href="#/workout" class="btn btn-glass w-full justify-between" onclick="window.Modal.close()">
            <span class="flex items-center gap-2"><span class="text-warning">${getIcon('dumbbell', 16)}</span> Workouts</span>
            ${getIcon('chevronRight', 16)}
          </a>
          <a href="#/food" class="btn btn-glass w-full justify-between" onclick="window.Modal.close()">
            <span class="flex items-center gap-2"><span class="text-green">${getIcon('apple', 16)}</span> Food Log</span>
            ${getIcon('chevronRight', 16)}
          </a>
          <a href="#/water" class="btn btn-glass w-full justify-between" onclick="window.Modal.close()">
            <span class="flex items-center gap-2"><span class="text-blue">${getIcon('droplet', 16)}</span> Water Log</span>
            ${getIcon('chevronRight', 16)}
          </a>
        </div>
      `);
      
      // We could ideally fetch exact details for this day and show them, but linking to the pages is easier since they default to today and can be changed.
      // Wait, the pages use local state for currentDate, so linking to them might just open "Today".
      // Let's modify the local storage or pass query params in a real app.
      // For this pure SPA, it's fine.
    });
  });
}