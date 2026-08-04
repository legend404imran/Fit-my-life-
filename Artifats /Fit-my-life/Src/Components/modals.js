export const Modal = {
  container: null,
  
  init(el) {
    this.container = el;
    window.Modal = this; // export to window for inline onclick handlers
  },
  
  open(title, htmlContent, customActions = '') {
    if (!this.container) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fade-in';
    // Needs a slight delay to allow display block before opacity transition
    setTimeout(() => overlay.classList.add('active'), 10);
    
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">${title}</h2>
          <button class="modal-close p-2 bg-card rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          ${htmlContent}
        </div>
        ${customActions ? `<div class="modal-actions mt-6 flex justify-end gap-2">${customActions}</div>` : ''}
      </div>
    `;
    
    this.container.appendChild(overlay);
    
    const closeBtn = overlay.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.close());
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
  },
  
  close() {
    if (!this.container) return;
    const overlay = this.container.querySelector('.modal-overlay:last-child');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 200);
    }
  }
};