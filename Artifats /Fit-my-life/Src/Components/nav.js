import { getIcon } from '../utils/icons.js';

export function renderNav(container) {
  const items = [
    { id: 'dashboard', icon: 'home', label: 'Home', path: '#/' },
    { id: 'food', icon: 'apple', label: 'Food', path: '#/food' },
    { id: 'water', icon: 'droplet', label: 'Water', path: '#/water' },
    { id: 'workout', icon: 'dumbbell', label: 'Workout', path: '#/workout' },
    { id: 'more', icon: 'menu', label: 'More', path: '#', action: 'toggleMenu' }
  ];
  
  const allPages = [
    { icon: 'activity', label: 'Progress', path: '#/progress' },
    { icon: 'moon', label: 'Sleep', path: '#/sleep' },
    { icon: 'checkCircle', label: 'Habits', path: '#/habits' },
    { icon: 'smile', label: 'Mood', path: '#/mood' },
    { icon: 'calendar', label: 'Calendar', path: '#/calendar' },
    { icon: 'fileText', label: 'Notes', path: '#/notes' },
    { icon: 'bell', label: 'Reminders', path: '#/reminders' },
    { icon: 'pieChart', label: 'Reports', path: '#/reports' },
    { icon: 'bookOpen', label: 'Exercises', path: '#/exercises' },
    { icon: 'user', label: 'Profile', path: '#/profile' },
    { icon: 'settings', label: 'Settings', path: '#/settings' }
  ];

  // Mobile Bottom Nav
  const bottomNav = document.createElement('nav');
  bottomNav.className = 'bottom-nav';
  bottomNav.innerHTML = items.map(item => `
    <a href="${item.path}" class="nav-item" data-action="${item.action || ''}">
      ${getIcon(item.icon, 24)}
      <span class="text-xs">${item.label}</span>
    </a>
  `).join('');

  // Desktop Sidebar
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar fade-in';
  sidebar.innerHTML = `
    <div class="mb-6 flex items-center gap-2 px-2">
      <div class="text-blue">${getIcon('activity', 28, 2.5)}</div>
      <h1 class="text-xl font-bold">Fit My Life</h1>
    </div>
    <div class="flex-col gap-2" style="flex: 1; overflow-y: auto;">
      ${items.filter(i => i.id !== 'more').map(item => `
        <a href="${item.path}" class="nav-item flex items-center" style="flex-direction:row; padding: 12px; border-radius:12px; gap: 12px; justify-content:flex-start">
          ${getIcon(item.icon, 20)}
          <span class="font-semibold">${item.label}</span>
        </a>
      `).join('')}
      <div class="mt-4 mb-2 px-4 text-xs text-muted font-bold uppercase tracking-wider">MORE</div>
      ${allPages.map(item => `
        <a href="${item.path}" class="nav-item flex items-center" style="flex-direction:row; padding: 10px 12px; border-radius:12px; gap: 12px; justify-content:flex-start">
          ${getIcon(item.icon, 18)}
          <span>${item.label}</span>
        </a>
      `).join('')}
    </div>
  `;

  container.appendChild(sidebar);
  container.appendChild(bottomNav);

  // Handle "More" overlay for mobile
  bottomNav.querySelector('[data-action="toggleMenu"]').addEventListener('click', (e) => {
    e.preventDefault();
    showMoreMenu(allPages);
  });
}

function showMoreMenu(pages) {
  const existing = document.getElementById('more-menu-overlay');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.id = 'more-menu-overlay';
  overlay.className = 'modal-overlay active fade-in';
  overlay.style.alignItems = 'flex-end';
  
  overlay.innerHTML = `
    <div class="modal-content w-full" style="border-radius: 24px 24px 0 0; margin:0; max-width:100%; transform:translateY(0); background:rgba(18,18,26,0.95); backdrop-filter:blur(20px);">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">More</h2>
        <button id="close-more-menu" class="p-2 bg-card rounded-full">${getIcon('x', 20)}</button>
      </div>
      <div class="grid grid-cols-3 gap-4 pb-8">
        ${pages.map(page => `
          <a href="${page.path}" class="card flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div class="text-blue">${getIcon(page.icon, 28)}</div>
            <span class="text-xs font-semibold">${page.label}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('close-more-menu').addEventListener('click', () => {
    overlay.remove();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}