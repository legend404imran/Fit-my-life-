import { getIcon } from '../utils/icons.js';
import { Modal } from './modals.js';

export const Fab = {
  render(container) {
    const fab = document.createElement('button');
    fab.className = 'fab fade-in';
    fab.innerHTML = getIcon('plus', 28, 3);
    
    fab.addEventListener('click', () => {
      Modal.open('Quick Add', `
        <div class="grid grid-cols-2 gap-4">
          <a href="#/food" class="card flex flex-col items-center gap-2" onclick="window.Modal.close()">
            <div class="text-green">${getIcon('apple', 32)}</div>
            <span class="font-bold">Log Food</span>
          </a>
          <a href="#/water" class="card flex flex-col items-center gap-2" onclick="window.Modal.close()">
            <div class="text-blue">${getIcon('droplet', 32)}</div>
            <span class="font-bold">Log Water</span>
          </a>
          <a href="#/workout" class="card flex flex-col items-center gap-2" onclick="window.Modal.close()">
            <div style="color:var(--warning)">${getIcon('dumbbell', 32)}</div>
            <span class="font-bold">Workout</span>
          </a>
          <a href="#/notes" class="card flex flex-col items-center gap-2" onclick="window.Modal.close()">
            <div class="text-white">${getIcon('fileText', 32)}</div>
            <span class="font-bold">Note</span>
          </a>
        </div>
      `);
    });
    
    container.appendChild(fab);
  }
};