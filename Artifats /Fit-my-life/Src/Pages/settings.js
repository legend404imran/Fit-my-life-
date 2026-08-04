import { DB } from '../db.js';
import { getIcon } from '../utils/icons.js';
import { Modal } from '../components/modals.js';
import { Toast } from '../components/toast.js';

export async function render(container) {
  const store = window.Store;
  const settings = store.get('fml_settings', { theme: 'dark' });
  const profile = store.get('fml_profile', {});
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
        ${getIcon('settings', 24)} Settings
      </h1>
      
      <div class="card mb-6 p-0 overflow-hidden">
        <a href="#/profile" class="p-4 flex items-center justify-between border-b border-glass-border hover-elevate cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-blue-glow text-blue flex items-center justify-center text-xl font-bold">
              ${profile.name ? profile.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div class="font-bold">${profile.name || 'User Profile'}</div>
              <div class="text-xs text-muted">Edit goals and targets</div>
            </div>
          </div>
          <div class="text-muted">${getIcon('chevronRight', 20)}</div>
        </a>
      </div>
      
      <h3 class="font-bold text-sm text-muted mb-2 px-2 uppercase tracking-wider">Appearance</h3>
      <div class="card mb-6 p-0 overflow-hidden flex flex-col">
        <div class="p-4 flex items-center justify-between border-b border-glass-border">
          <div class="flex items-center gap-3">
            <div class="text-secondary">${getIcon('moon', 20)}</div>
            <span class="font-semibold">Light Mode</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="theme-toggle" class="sr-only peer" ${settings.theme === 'light' ? 'checked' : ''}>
            <div class="w-11 h-6 bg-glass-border rounded-full peer peer-checked:bg-blue after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
      </div>
      
      <h3 class="font-bold text-sm text-muted mb-2 px-2 uppercase tracking-wider">Data</h3>
      <div class="card mb-6 p-0 overflow-hidden flex flex-col">
        <button id="export-data" class="p-4 flex items-center justify-between border-b border-glass-border hover-elevate text-left">
          <div class="flex items-center gap-3">
            <div class="text-secondary">${getIcon('fileText', 20)}</div>
            <span class="font-semibold">Export All Data</span>
          </div>
          <div class="text-muted">${getIcon('chevronRight', 20)}</div>
        </button>
        <button id="reset-data" class="p-4 flex items-center justify-between hover-elevate text-left">
          <div class="flex items-center gap-3">
            <div class="text-danger">${getIcon('trash', 20)}</div>
            <span class="font-semibold text-danger">Reset App Data</span>
          </div>
          <div class="text-muted">${getIcon('chevronRight', 20)}</div>
        </button>
      </div>
      
      <div class="text-center text-xs text-muted mt-8">
        Fit My Life v1.0.0<br/>
        Built with vanilla JavaScript
      </div>
    </div>
  `;

  // Theme Toggle
  container.querySelector('#theme-toggle').addEventListener('change', (e) => {
    const isLight = e.target.checked;
    settings.theme = isLight ? 'light' : 'dark';
    store.set('fml_settings', settings);
    
    if (isLight) document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  });

  // Export Data
  container.querySelector('#export-data').addEventListener('click', async () => {
    try {
      const data = {
        profile: store.get('fml_profile'),
        settings: store.get('fml_settings'),
        workouts: await DB.getAll('workouts'),
        meals: await DB.getAll('meals'),
        water: await DB.getAll('water_log'),
        sleep: await DB.getAll('sleep_log'),
        weight: await DB.getAll('weight_log'),
        measurements: await DB.getAll('body_measurements'),
        habits: await DB.getAll('habits'),
        moods: await DB.getAll('moods'),
        notes: await DB.getAll('notes'),
        reminders: await DB.getAll('reminders')
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fit-my-life-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Toast.show('Data exported successfully');
    } catch (e) {
      Toast.show('Export failed', 'error');
    }
  });

  // Reset Data
  container.querySelector('#reset-data').addEventListener('click', () => {
    Modal.open('Reset All Data', `
      <div class="text-center text-danger mb-4">
        ${getIcon('alertTriangle', 48, 2)}
      </div>
      <p class="text-sm mb-6 text-center">Are you absolute sure? This will delete all workouts, meals, logs, and profile data. This cannot be undone.</p>
      <div class="flex gap-2">
        <button class="btn btn-glass flex-1" onclick="window.Modal.close()">Cancel</button>
        <button id="confirm-reset" class="btn btn-danger flex-1">Reset</button>
      </div>
    `);
    
    document.getElementById('confirm-reset').addEventListener('click', async () => {
      localStorage.clear();
      await DB.clear('workouts');
      await DB.clear('meals');
      await DB.clear('water_log');
      await DB.clear('sleep_log');
      await DB.clear('weight_log');
      await DB.clear('body_measurements');
      await DB.clear('habits');
      await DB.clear('moods');
      await DB.clear('notes');
      await DB.clear('reminders');
      
      Modal.close();
      Toast.show('App reset. Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    });
  });
}