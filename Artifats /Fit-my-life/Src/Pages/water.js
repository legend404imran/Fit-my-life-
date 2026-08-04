import { DB } from '../db.js';
import { getIcon } from '../utils/icons.js';
import { Toast } from '../components/toast.js';

let currentDate = new Date().toISOString().split('T')[0];

export async function render(container) {
  await renderWaterPage(container);
}

async function renderWaterPage(container) {
  const logs = await DB.getByIndex('water_log', 'date', currentDate);
  const totalWater = logs.reduce((sum, entry) => sum + entry.amount, 0);
  
  const targets = window.Store.get('fml_profile', {}).dailyTargets || { water: 2500 };
  const goal = targets.water;
  const percent = Math.min((totalWater / goal) * 100, 100);
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Water Tracker</h1>
        <input type="date" id="water-date" value="${currentDate}" class="bg-card text-sm py-1 px-2 w-auto" />
      </div>
      
      <div class="flex flex-col items-center mb-8 pt-4">
        <div class="relative w-48 h-64 border-4 border-glass-border rounded-b-3xl rounded-t-xl overflow-hidden mb-4 glass-panel" style="border-top-width: 8px;">
          <div class="absolute bottom-0 left-0 w-full bg-blue transition-all duration-1000 ease-in-out" style="height: ${percent}%; opacity: 0.8; box-shadow: 0 -4px 20px var(--blue-glow);">
            <div class="absolute w-[200%] h-8 bg-blue-glow rounded-full" style="top:-16px; left:-50%; filter:blur(4px);"></div>
          </div>
          <div class="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
            <span class="text-4xl font-bold text-white">${totalWater}</span>
            <span class="text-sm font-semibold text-white">/ ${goal} ml</span>
          </div>
        </div>
      </div>
      
      <h3 class="text-lg font-bold mb-4">Quick Add</h3>
      <div class="grid grid-cols-4 gap-3 mb-8">
        ${[100, 250, 500, 750].map(amt => `
          <button class="quick-add-btn card flex flex-col items-center py-4" data-amount="${amt}">
            <span class="text-blue mb-1">${getIcon('droplet', 24)}</span>
            <span class="text-xs font-bold">+${amt}</span>
          </button>
        `).join('')}
      </div>
      
      <h3 class="text-lg font-bold mb-4">Today's Log</h3>
      <div class="flex flex-col gap-2">
        ${logs.length === 0 ? `
          <div class="card text-center text-sm text-muted py-4 border-dashed">No water logged today.</div>
        ` : logs.sort((a,b) => b.timestamp - a.timestamp).map(log => `
          <div class="card py-3 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="text-blue">${getIcon('droplet', 16)}</div>
              <div>
                <div class="font-semibold">${log.amount} ml</div>
                <div class="text-xs text-muted">${new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            </div>
            <button class="delete-water-btn p-2 text-muted" data-id="${log.id}">${getIcon('trash', 16)}</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Events
  container.querySelector('#water-date').addEventListener('change', (e) => {
    currentDate = e.target.value;
    renderWaterPage(container);
  });

  container.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const amount = parseInt(e.currentTarget.dataset.amount);
      const entry = {
        id: 'w_' + Date.now(),
        date: currentDate,
        amount,
        timestamp: Date.now()
      };
      await DB.put('water_log', entry);
      
      // Check goal
      if (totalWater < goal && (totalWater + amount) >= goal) {
        Toast.show('Daily water goal reached! 🎉', 'success');
      } else {
        Toast.show(`+${amount}ml logged`, 'info');
      }
      
      renderWaterPage(container);
    });
  });

  container.querySelectorAll('.delete-water-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      await DB.delete('water_log', id);
      renderWaterPage(container);
    });
  });
}