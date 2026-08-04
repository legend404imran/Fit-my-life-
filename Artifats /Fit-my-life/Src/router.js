export async function initRouter(container) {
  const render = async () => {
    let hash = window.location.hash || '#/';
    let path = hash.split('?')[0];
    
    // Determine page module to load
    let pageName = path === '#/' ? 'dashboard' : path.substring(2);
    
    // Basic fallback for unknown routes to dashboard
    const validPages = ['dashboard', 'food', 'water', 'workout', 'exercises', 'sleep', 'habits', 'progress', 'mood', 'calendar', 'notes', 'reminders', 'reports', 'settings', 'profile'];
    if (!validPages.includes(pageName)) {
      pageName = 'dashboard';
      window.location.hash = '#/';
    }

    try {
      const pageModule = await import(`./pages/${pageName}.js`);
      
      container.innerHTML = '';
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'page-enter w-full h-full';
      await pageModule.render(pageWrapper);
      container.appendChild(pageWrapper);
      
      // Update nav state
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('href') === path);
      });
      
      // Close mobile "more" menu if it's open
      const moreMenu = document.getElementById('more-menu-overlay');
      if (moreMenu) moreMenu.remove();
      
    } catch (e) {
      console.error('Route error:', e);
      container.innerHTML = `<div class="page-container page-enter empty-state"><h2>Error Loading Page</h2><p>${e.message}</p></div>`;
    }
  };

  window.addEventListener('hashchange', render);
  render();
}