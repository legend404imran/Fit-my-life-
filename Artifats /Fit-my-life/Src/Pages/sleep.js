import { DB } from '../db.js';
import { Charts } from '../components/charts.js';
import { getIcon } from '../utils/icons.js';
import { Toast } from '../components/toast.js';

let currentDate = new Date().toISOString().split('T')[0];

export async function render(container) {
  const log = await DB.get('sleep_log', currentDate) || { bedTime: '22:30', wakeTime: '06:30', quality: 3, hours: 8 };
  const pastWeek = await getPastWeekSleep();
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2 text-indigo-400">
          <span style="color:#818cf8">${getIcon('moon', 24)}</span> Sleep
        </h1>
        <input type="date" id="sleep-date" value="${currentDate}" class="bg-card text-sm py-1 px-2 w-auto" />
      </div>
      
      <div class="card mb-6">
        <h2 class="text-lg font-bold mb-4">Log Sleep</h2>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="form-label">Bed Time</label>
            <input type="time" id="bed-time" value="${log.bedTime}" />
          </div>
          <div>
            <label class="form-label">Wake Time</label>
            <input type="time" id="wake-time" value="${log.wakeTime}" />
          </div>
        </div>
        
        <div class="mb-4">
          <label class="form-label">Quality (1-5)</label>
          <div class="flex justify-between items-center bg-secondary rounded-lg p-2" id="quality-rating">
            ${[1,2,3,4,5].map(q => `
              <button class="p-2 text-xl filter transition-all ${log.quality === q ? 'opacity-100 scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-40 grayscale'} hover:opacity-100" data-val="${q}">
                ${getQualityEmoji(q)}
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="sleep-quality" value="${log.quality}" />
        </div>
        
        <div class="text-center py-2 mb-4">
          <div class="text-3xl font-bold text-blue" id="hours-display">${log.hours.toFixed(1)} <span class="text-sm font-normal text-muted">hrs</span></div>
        </div>
        
        <button id="save-sleep" class="btn btn-primary w-full">Save Sleep</button>
      </div>
      
      <div class="card" style="height: 220px">
        <h3 class="text-sm font-bold text-muted mb-4">LAST 7 DAYS</h3>
        <canvas id="sleep-chart" width="300" height="130" style="width:100%; height:100%; display:block;"></canvas>
      </div>
    </div>
  `;

  // Helpers
  function getQualityEmoji(q) {
    const emojis = ['😫','🥱','😐','🙂','🤩'];
    return emojis[q-1] || '😐';
  }
  
  function calcHours(bed, wake) {
    if (!bed || !wake) return 0;
    const [h1, m1] = bed.split(':').map(Number);
    const [h2, m2] = wake.split(':').map(Number);
    let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins < 0) mins += 24 * 60; // Next day
    return mins / 60;
  }

  // Events
  container.querySelector('#sleep-date').addEventListener('change', (e) => {
    currentDate = e.target.value;
    render(container);
  });
  
  const updateHours = () => {
    const bed = container.querySelector('#bed-time').value;
    const wake = container.querySelector('#wake-time').value;
    const hrs = calcHours(bed, wake);
    container.querySelector('#hours-display').innerHTML = `${hrs.toFixed(1)} <span class="text-sm font-normal text-muted">hrs</span>`;
  };
  
  container.querySelector('#bed-time').addEventListener('change', updateHours);
  container.querySelector('#wake-time').addEventListener('change', updateHours);
  
  container.querySelectorAll('#quality-rating button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = parseInt(e.currentTarget.dataset.val);
      container.querySelector('#sleep-quality').value = val;
      
      container.querySelectorAll('#quality-rating button').forEach(b => {
        b.className = `p-2 text-xl filter transition-all ${parseInt(b.dataset.val) === val ? 'opacity-100 scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-40 grayscale'} hover:opacity-100`;
      });
    });
  });

  container.querySelector('#save-sleep').addEventListener('click', async () => {
    const bedTime = container.querySelector('#bed-time').value;
    const wakeTime = container.querySelector('#wake-time').value;
    const quality = parseInt(container.querySelector('#sleep-quality').value);
    const hours = calcHours(bedTime, wakeTime);
    
    await DB.put('sleep_log', {
      date: currentDate,
      bedTime,
      wakeTime,
      quality,
      hours,
      timestamp: Date.now()
    });
    
    Toast.show('Sleep logged');
    render(container);
  });

  // Render chart
  setTimeout(() => {
    const canvas = container.querySelector('#sleep-chart');
    if (canvas && pastWeek) {
      Charts.bar(canvas, {
        labels: pastWeek.map(d => d.date.substring(8, 10)), // just day number
        data: pastWeek.map(d => d.hours),
        color: '#818cf8', // indigo
        maxVal: 12
      });
    }
  }, 100);
}

async function getPastWeekSleep() {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = await DB.get('sleep_log', dateStr);
    data.push({
      date: dateStr,
      hours: log ? log.hours : 0
    });
  }
  return data;
}