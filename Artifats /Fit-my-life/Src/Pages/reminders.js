import { DB } from '../db.js';
import { getIcon } from '../utils/icons.js';
import { Modal } from '../components/modals.js';
import { Toast } from '../components/toast.js';

export async function render(container) {
  const reminders = await DB.getAll('reminders');
  
  // Check notification permission
  let permStatus = 'default';
  if ('Notification' in window) {
    permStatus = Notification.permission;
  }
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          ${getIcon('bell', 24)} Reminders
        </h1>
        <button id="add-rem-btn" class="bg-blue text-white w-8 h-8 rounded-full flex items-center justify-center">
          ${getIcon('plus', 20)}
        </button>
      </div>
      
      ${permStatus !== 'granted' ? `
        <div class="card bg-warning/10 border-warning/30 mb-6 flex flex-col items-center text-center p-4">
          <div class="text-warning mb-2">${getIcon('bell', 32)}</div>
          <p class="text-sm mb-3">Enable notifications to receive alerts.</p>
          <button id="req-perm-btn" class="btn btn-primary btn-sm">Enable Notifications</button>
        </div>
      ` : ''}
      
      ${reminders.length === 0 ? `
        <div class="empty-state card border-dashed">
          ${getIcon('clock', 48)}
          <h2 class="text-lg font-bold mb-2">No Reminders</h2>
          <p class="text-sm text-muted mb-4">Set reminders for water, meals, or workouts.</p>
        </div>
      ` : `
        <div class="flex flex-col gap-3">
          ${reminders.map(r => `
            <div class="card p-4 flex justify-between items-center ${!r.active ? 'opacity-50 grayscale' : ''}">
              <div class="flex items-center gap-4">
                <div class="text-2xl font-bold font-mono">${r.time}</div>
                <div>
                  <div class="font-bold text-sm">${r.title}</div>
                  <div class="text-xs text-muted flex items-center gap-1">
                    ${getIcon(getTypeIcon(r.type), 12)} ${r.type} • ${r.frequency}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer toggle-rem-active" data-id="${r.id}" ${r.active ? 'checked' : ''}>
                  <div class="w-11 h-6 bg-glass-border rounded-full peer peer-checked:bg-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
                <button class="text-danger del-rem" data-id="${r.id}">${getIcon('trash', 16)}</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  // Permission logic
  const reqBtn = container.querySelector('#req-perm-btn');
  if (reqBtn) {
    reqBtn.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        Toast.show('Browser does not support notifications', 'error');
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        Toast.show('Notifications enabled!');
        render(container);
      } else {
        Toast.show('Notifications denied', 'error');
      }
    });
  }

  // Toggles
  container.querySelectorAll('.toggle-rem-active').forEach(inp => {
    inp.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const r = reminders.find(x => x.id === id);
      r.active = e.target.checked;
      await DB.put('reminders', r);
      Toast.show(r.active ? 'Reminder activated' : 'Reminder paused');
      render(container);
    });
  });

  container.querySelectorAll('.del-rem').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      await DB.delete('reminders', e.currentTarget.dataset.id);
      render(container);
    });
  });

  container.querySelector('#add-rem-btn').addEventListener('click', () => {
    Modal.open('New Reminder', `
      <form id="rem-form" class="flex flex-col gap-4">
        <div>
          <label class="form-label">Message</label>
          <input type="text" id="r-title" placeholder="Drink 500ml of water" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Time</label>
            <input type="time" id="r-time" required />
          </div>
          <div>
            <label class="form-label">Type</label>
            <select id="r-type">
              <option value="Water">Water</option>
              <option value="Meal">Meal</option>
              <option value="Workout">Workout</option>
              <option value="Medicine">Medicine</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label class="form-label">Frequency</label>
          <select id="r-freq">
            <option value="Daily">Daily</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="Once">Once</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary w-full mt-4">Save Reminder</button>
      </form>
    `);

    document.getElementById('rem-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const rem = {
        id: 'r_' + Date.now(),
        title: document.getElementById('r-title').value,
        time: document.getElementById('r-time').value,
        type: document.getElementById('r-type').value,
        frequency: document.getElementById('r-freq').value,
        active: true
      };
      await DB.put('reminders', rem);
      Modal.close();
      Toast.show('Reminder set');
      render(container);
    });
  });
}

function getTypeIcon(type) {
  if (type === 'Water') return 'droplet';
  if (type === 'Meal') return 'apple';
  if (type === 'Workout') return 'dumbbell';
  return 'bell';
}