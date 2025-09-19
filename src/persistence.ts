import type { Key, TPath } from './type';

interface AnyStateStore {
  getState: () => any;
  setState: (newState: any) => void;
  getItem: (path: TPath) => any;
  setItem: (path: TPath, value: any) => void;
  watch: (path: string, callback: (newValue: any, oldValue: any) => void) => () => void;
}

export interface PersistencePlugin {
  name: string;
  load: () => Promise<any> | any;
  save: (state: any) => Promise<void> | void;
  clear?: () => Promise<void> | void;
}

export interface PersistenceOptions {
  key?: string;
  plugins?: PersistencePlugin[];
  paths?: string[];
  throttle?: number;
  autoSave?: boolean;
}

/**
 * Local Storage persistence plugin
 */
export const localStoragePlugin = (key: string = 'anystate'): PersistencePlugin => ({
  name: 'localStorage',
  load: () => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  },
  save: (state: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
});

/**
 * Session Storage persistence plugin
 */
export const sessionStoragePlugin = (key: string = 'anystate'): PersistencePlugin => ({
  name: 'sessionStorage',
  load: () => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load from sessionStorage:', error);
      return null;
    }
  },
  save: (state: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }
});

/**
 * IndexedDB persistence plugin
 */
export const indexedDBPlugin = (dbName: string = 'anystate', storeName: string = 'state', key: string = 'state'): PersistencePlugin => ({
  name: 'indexedDB',
  load: async () => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }
    
    return new Promise((resolve) => {
      const request = indexedDB.open(dbName, 1);
      
      request.onerror = () => {
        console.warn('Failed to open IndexedDB');
        resolve(null);
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || null);
        };
        
        getRequest.onerror = () => {
          console.warn('Failed to load from IndexedDB');
          resolve(null);
        };
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
    });
  },
  save: async (state: any) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return;
    }
    
    return new Promise<void>((resolve) => {
      const request = indexedDB.open(dbName, 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put({ data: state }, key);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
          console.warn('Failed to save to IndexedDB');
          resolve();
        };
      };
      
      request.onerror = () => {
        console.warn('Failed to open IndexedDB for saving');
        resolve();
      };
    });
  },
  clear: async () => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return;
    }
    
    return new Promise<void>((resolve) => {
      const request = indexedDB.open(dbName, 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(key);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
          console.warn('Failed to clear IndexedDB');
          resolve();
        };
      };
      
      request.onerror = () => {
        console.warn('Failed to open IndexedDB for clearing');
        resolve();
      };
    });
  }
});

/**
 * Custom persistence plugin factory
 */
export const createCustomPlugin = (
  name: string,
  load: () => Promise<any> | any,
  save: (state: any) => Promise<void> | void,
  clear?: () => Promise<void> | void
): PersistencePlugin => ({
  name,
  load,
  save,
  clear
});

/**
 * Add persistence to an anyState store
 */
export const addPersistence = async (
  store: AnyStateStore,
  options: PersistenceOptions = {}
): Promise<{
  save: () => Promise<void>;
  load: () => Promise<void>;
  clear: () => Promise<void>;
  destroy: () => void;
}> => {
  const {
    plugins = [localStoragePlugin()],
    paths = [],
    throttle = 1000,
    autoSave = true
  } = options;

  let saveTimeout: NodeJS.Timeout | null = null;
  let unwatchers: (() => void)[] = [];

  // Throttled save function
  const throttledSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(async () => {
      await save();
    }, throttle);
  };

  // Save to all plugins
  const save = async () => {
    const state = store.getState();
    
    // If paths are specified, only save those paths
    let dataToSave = state;
    if (paths.length > 0) {
      dataToSave = {};
      paths.forEach(path => {
        const value = store.getItem(path);
        if (value !== undefined) {
          // Simple path assignment (could be improved for nested paths)
          const keys = path.split('.');
          let target = dataToSave;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
          }
          target[keys[keys.length - 1]] = value;
        }
      });
    }

    for (const plugin of plugins) {
      try {
        await plugin.save(dataToSave);
      } catch (error) {
        console.warn(`Failed to save with ${plugin.name}:`, error);
      }
    }
  };

  // Load from plugins (first successful load wins)
  const load = async () => {
    for (const plugin of plugins) {
      try {
        const data = await plugin.load();
        if (data !== null && data !== undefined) {
          if (paths.length > 0) {
            // Only restore specified paths
            paths.forEach(path => {
              const value = getNestedValue(data, path);
              if (value !== undefined) {
                store.setItem(path, value);
              }
            });
          } else {
            // Restore entire state
            store.setState(data);
          }
          return;
        }
      } catch (error) {
        console.warn(`Failed to load with ${plugin.name}:`, error);
      }
    }
  };

  // Clear all plugins
  const clear = async () => {
    for (const plugin of plugins) {
      try {
        if (plugin.clear) {
          await plugin.clear();
        }
      } catch (error) {
        console.warn(`Failed to clear with ${plugin.name}:`, error);
      }
    }
  };

  // Set up auto-save watchers
  if (autoSave) {
    if (paths.length > 0) {
      // Watch specific paths
      paths.forEach(path => {
        const unwatch = store.watch(path, throttledSave);
        unwatchers.push(unwatch);
      });
    } else {
      // Watch entire state by watching root properties
      const state = store.getState();
      Object.keys(state).forEach(key => {
        const unwatch = store.watch(key, throttledSave);
        unwatchers.push(unwatch);
      });
    }
  }

  // Cleanup function
  const destroy = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    unwatchers.forEach(unwatch => unwatch());
    unwatchers = [];
  };

  return {
    save,
    load,
    clear,
    destroy
  };
};

// Helper function to get nested value
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};