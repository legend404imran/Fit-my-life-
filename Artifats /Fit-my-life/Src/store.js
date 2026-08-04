export const initStore = () => {
  window.Store = {
    get(key, defaultValue = null) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return defaultValue;
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch custom event for reactive UI
      window.dispatchEvent(new CustomEvent(`store:${key}:changed`, { detail: value }));
    },
    remove(key) {
      localStorage.removeItem(key);
    }
  };
  
  // Apply theme on load
  const settings = window.Store.get('fml_settings', { theme: 'dark' });
  if (settings.theme === 'light') {
    document.body.classList.add('light-mode');
  }
};