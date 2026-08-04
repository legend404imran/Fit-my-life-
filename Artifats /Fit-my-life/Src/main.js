import './styles.css';
import { initRouter } from './router.js';
import { DB } from './db.js';
import { initStore } from './store.js';
import { renderNav } from './components/nav.js';
import { Toast } from './components/toast.js';
import { Modal } from './components/modals.js';

async function bootstrap() {
  // Initialize IndexedDB
  await DB.init();
  
  // Initialize Store (LocalStorage sync)
  initStore();
  
  // Setup App container
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="main-content">
      <main id="router-view"></main>
    </div>
    <div id="nav-container"></div>
    <div id="toast-container"></div>
    <div id="modal-container"></div>
  `;
  
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration failed: ', err);
      });
    });
  }

  // Initialize UI components
  renderNav(document.getElementById('nav-container'));
  Toast.init(document.getElementById('toast-container'));
  Modal.init(document.getElementById('modal-container'));
  
  // Handle onboarding
  const store = window.Store;
  if (!store.get('fml_onboarded')) {
    window.location.hash = '#/profile';
    setTimeout(() => {
      Toast.show("Welcome to Fit My Life! Let's set up your profile.", 'info');
    }, 500);
  }

  // Start Router
  initRouter(document.getElementById('router-view'));
}

bootstrap();