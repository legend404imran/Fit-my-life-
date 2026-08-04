import { DB } from '../db.js';
import { Charts } from '../components/charts.js';
import { Calc } from '../utils/calculations.js';
import { getIcon } from '../utils/icons.js';
import { Modal } from '../components/modals.js';
import { Toast } from '../components/toast.js';

export async function render(container) {
  const profile = window.Store.get('fml_profile', {});
  const weightLogs = await DB.getAll('weight_log');
  weightLogs.sort((a,b) => a.date.localeCompare(b.date)); // chronological
  
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : (profile.weight || 0);
  const bmi = Calc.bmi(currentWeight, profile.height);
  const bmiCat = Calc.bmiCategory(bmi);
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
        ${getIcon('activity', 24)} Progress
      </h1>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="card text-center p-4">
          <div class="text-sm text-secondary mb-1">Current Weight</div>
          <div class="text-2xl font-bold text-white mb-2">${currentWeight || '--'} kg</div>
          <button id="log-weight-btn" class="btn btn-primary btn-sm w-full">Log Weight</button>
        </div>
        <div class="card text-center p-4">
          <div class="text-sm text-secondary mb-1">BMI</div>
          <div class="text-2xl font-bold mb-1" style="color: ${bmiCat?.color || 'var(--text-primary)'}">${bmi || '--'}</div>
          <div class="text-xs font-semibold" style="color: ${bmiCat?.color || 'var(--text-muted)'}">${bmiCat?.label || 'Setup Profile'}</div>
        </div>
      </div>
      
      <div class="card mb-6" style="height: 250px">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-sm font-bold text-muted">WEIGHT TREND</h3>
          <span class="text-xs bg-card px-2 py-1 rounded text-secondary border border-glass-border">Last 30 Days</span>
        </div>
        ${weightLogs.length < 2 ? `
          <div class="h-full flex items-center justify-center text-sm text-muted border-dashed border border-glass-border rounded-lg m-2 p-4 text-center">
            Log your weight on at least 2 different days to see the trend chart.
          </div>
        ` : `
          <canvas id="weight-chart" width="300" height="150" style="width:100%; height:100%; display:block;"></canvas>
        `}
      </div>
      
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">Body Measurements</h3>
        <button id="log-meas-btn" class="text-blue bg-blue-glow rounded-full p-2">${getIcon('plus', 16)}</button>
      </div>
      
      <div id="measurements-list" class="flex flex-col gap-3">
        <div class="text-center text-sm text-muted p-4 border border-dashed border-glass-border rounded-xl">
          Click + to add body measurements
        </div>
      </div>
    </div>
  `;

  // Render Chart if data exists
  if (weightLogs.length >= 2) {
    setTimeout(() => {
      const canvas = container.querySelector('#weight-chart');
      if (!canvas) return;
      
      // Simple line chart implementation
      const ctx = canvas.getContext('2d');
      const data = weightLogs.slice(-30); // max 30 points
      const min = Math.min(...data.map(d => d.weight)) - 2;
      const max = Math.max(...data.map(d => d.weight)) + 2;
      
      const width = canvas.width;
      const height = canvas.height;
      const pad = 20;
      const chartW = width - pad*2;
      const chartH = height - pad*2;
      
      ctx.clearRect(0,0,width,height);
      
      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, pad); ctx.lineTo(width-pad, pad);
      ctx.moveTo(pad, height-pad); ctx.lineTo(width-pad, height-pad);
      ctx.stroke();
      
      // Line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      
      data.forEach((point, i) => {
        const x = pad + (i / (data.length - 1)) * chartW;
        const y = height - pad - ((point.weight - min) / (max - min)) * chartH;
        if (i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      });
      ctx.stroke();
      
      // Points
      ctx.fillStyle = '#0a0a0f';
      data.forEach((point, i) => {
        const x = pad + (i / (data.length - 1)) * chartW;
        const y = height - pad - ((point.weight - min) / (max - min)) * chartH;
        ctx.beginPath();
        ctx.arc(x,y, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
      });
      
    }, 100);
  }

  // Load Measurements
  const renderMeasurements = async () => {
    const meas = await DB.getAll('body_measurements');
    meas.sort((a,b) => b.date.localeCompare(a.date)); // newest first
    
    const list = container.querySelector('#measurements-list');
    if (meas.length > 0) {
      list.innerHTML = meas.map(m => `
        <div class="card p-4">
          <div class="flex justify-between items-center mb-3 pb-2 border-b border-glass-border">
            <span class="font-bold text-sm text-muted">${new Date(m.date).toLocaleDateString()}</span>
            <button class="text-danger del-meas" data-date="${m.date}">${getIcon('trash', 14)}</button>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center text-sm">
            <div><div class="text-muted text-xs">Chest</div><div class="font-semibold">${m.chest||'-'}</div></div>
            <div><div class="text-muted text-xs">Waist</div><div class="font-semibold">${m.waist||'-'}</div></div>
            <div><div class="text-muted text-xs">Arms</div><div class="font-semibold">${m.arms||'-'}</div></div>
            <div class="mt-2"><div class="text-muted text-xs">Legs</div><div class="font-semibold">${m.legs||'-'}</div></div>
            <div class="mt-2"><div class="text-muted text-xs">Shoulders</div><div class="font-semibold">${m.shoulders||'-'}</div></div>
            <div class="mt-2"><div class="text-muted text-xs">Neck</div><div class="font-semibold">${m.neck||'-'}</div></div>
          </div>
        </div>
      `).join('');
      
      list.querySelectorAll('.del-meas').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          await DB.delete('body_measurements', e.currentTarget.dataset.date);
          renderMeasurements();
        });
      });
    }
  };
  renderMeasurements();

  // Events
  container.querySelector('#log-weight-btn').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    Modal.open('Log Weight', `
      <form id="weight-form">
        <div class="mb-4">
          <label class="form-label">Date</label>
          <input type="date" id="w-date" value="${today}" required />
        </div>
        <div class="mb-6">
          <label class="form-label">Weight (kg)</label>
          <input type="number" id="w-val" step="0.1" value="${currentWeight || 70}" required />
        </div>
        <button type="submit" class="btn btn-primary w-full">Save</button>
      </form>
    `);
    
    document.getElementById('weight-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const date = document.getElementById('w-date').value;
      const weight = parseFloat(document.getElementById('w-val').value);
      await DB.put('weight_log', { date, weight, timestamp: Date.now() });
      Modal.close();
      Toast.show('Weight saved');
      render(container);
    });
  });

  container.querySelector('#log-meas-btn').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    Modal.open('Body Measurements', `
      <form id="meas-form">
        <div class="mb-4">
          <label class="form-label">Date</label>
          <input type="date" id="m-date" value="${today}" required />
        </div>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div><label class="form-label">Chest (cm)</label><input type="number" step="0.1" id="m-chest" /></div>
          <div><label class="form-label">Waist (cm)</label><input type="number" step="0.1" id="m-waist" /></div>
          <div><label class="form-label">Arms (cm)</label><input type="number" step="0.1" id="m-arms" /></div>
          <div><label class="form-label">Legs (cm)</label><input type="number" step="0.1" id="m-legs" /></div>
          <div><label class="form-label">Shoulders (cm)</label><input type="number" step="0.1" id="m-shoulders" /></div>
          <div><label class="form-label">Neck (cm)</label><input type="number" step="0.1" id="m-neck" /></div>
        </div>
        <button type="submit" class="btn btn-primary w-full">Save</button>
      </form>
    `);
    
    document.getElementById('meas-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const date = document.getElementById('m-date').value;
      const data = {
        date,
        chest: parseFloat(document.getElementById('m-chest').value) || 0,
        waist: parseFloat(document.getElementById('m-waist').value) || 0,
        arms: parseFloat(document.getElementById('m-arms').value) || 0,
        legs: parseFloat(document.getElementById('m-legs').value) || 0,
        shoulders: parseFloat(document.getElementById('m-shoulders').value) || 0,
        neck: parseFloat(document.getElementById('m-neck').value) || 0,
      };
      await DB.put('body_measurements', data);
      Modal.close();
      Toast.show('Measurements saved');
      renderMeasurements();
    });
  });
}