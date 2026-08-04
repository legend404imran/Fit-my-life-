import { getIcon } from '../utils/icons.js';

export const Toast = {
  container: null,
  
  init(el) {
    this.container = el;
    window.Toast = this;
  },
  
  show(message, type = 'success', duration = 3000) {
    if (!this.container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'checkCircle';
    let colorClass = 'text-green';
    if (type === 'error') { icon = 'x'; colorClass = 'text-danger'; }
    if (type === 'info') { icon = 'bell'; colorClass = 'text-blue'; }
    if (type === 'warning') { icon = 'activity'; colorClass = 'text-warning'; }
    
    toast.innerHTML = `
      <div class="${colorClass}">${getIcon(icon, 20)}</div>
      <div class="text-sm font-semibold">${message}</div>
    `;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }
};