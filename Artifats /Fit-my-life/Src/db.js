const DB_NAME = 'FitMyLifeDB';
const DB_VERSION = 1;

const STORES = [
  { name: 'workouts', keyPath: 'id', indices: ['date'] },
  { name: 'meals', keyPath: 'id', indices: ['date', 'type'] },
  { name: 'water_log', keyPath: 'date' },
  { name: 'sleep_log', keyPath: 'date' },
  { name: 'weight_log', keyPath: 'date' },
  { name: 'habits', keyPath: 'id' },
  { name: 'moods', keyPath: 'date' },
  { name: 'notes', keyPath: 'id', indices: ['date', 'pinned'] },
  { name: 'body_measurements', keyPath: 'date' },
  { name: 'reminders', keyPath: 'id' },
  { name: 'exercise_library', keyPath: 'id' },
  { name: 'custom_foods', keyPath: 'id' }
];

let dbInstance = null;

export const DB = {
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        STORES.forEach(storeConfig => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });
            if (storeConfig.indices) {
              storeConfig.indices.forEach(idx => {
                store.createIndex(idx, idx, { unique: false });
              });
            }
          }
        });
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  },

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async query(storeName, filterFn) {
    const all = await this.getAll(storeName);
    return all.filter(filterFn);
  },
  
  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};