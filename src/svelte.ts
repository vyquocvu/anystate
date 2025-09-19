import { writable, derived, readable } from 'svelte/store';
import type { Key, TPath } from './type';

interface AnyStateStore {
  getItem: (path: TPath) => any;
  setItem: (path: TPath, value: any) => void;
  watch: (path: string, callback: (newValue: any, oldValue: any) => void) => () => void;
}

/**
 * Creates a Svelte writable store from an anyState store path
 * @param store - The anyState store instance
 * @param path - The path to watch in the store
 * @returns Svelte writable store
 */
export function createAnyStateStore<T = any>(store: AnyStateStore, path: TPath) {
  const initialValue = store.getItem(path);
  const { subscribe, set, update } = writable<T>(initialValue);

  // Set up watching for changes from anyState
  const unwatch = store.watch(path as string, (newValue) => {
    set(newValue);
  });

  return {
    subscribe,
    set: (value: T) => {
      store.setItem(path, value);
      set(value);
    },
    update: (updater: (value: T) => T) => {
      const currentValue = store.getItem(path);
      const newValue = updater(currentValue);
      store.setItem(path, newValue);
      set(newValue);
    },
    // Method to unsubscribe from anyState watching
    destroy: () => {
      unwatch();
    }
  };
}

/**
 * Creates multiple Svelte stores from anyState store paths
 * @param store - The anyState store instance
 * @param paths - Object with keys as store names and values as paths
 * @returns Object with Svelte stores
 */
export function createAnyStateStores<T extends Record<string, any>>(
  store: AnyStateStore,
  paths: Record<keyof T, TPath>
): { [K in keyof T]: ReturnType<typeof createAnyStateStore> } {
  const stores = {} as any;
  
  for (const key in paths) {
    stores[key] = createAnyStateStore(store, paths[key]);
  }
  
  return stores;
}

/**
 * Creates a Svelte derived store from multiple anyState paths
 * @param store - The anyState store instance
 * @param paths - Array of paths to watch
 * @param deriveFn - Function to derive the value
 * @returns Svelte readable store
 */
export function createAnyStateDerived<T>(
  store: AnyStateStore,
  paths: TPath[],
  deriveFn: (...values: any[]) => T
) {
  const watchedStores = paths.map(path => createAnyStateStore(store, path));
  
  return derived(
    watchedStores,
    (values) => deriveFn(...values)
  );
}

/**
 * Creates a readable Svelte store from an anyState path (read-only)
 * @param store - The anyState store instance
 * @param path - The path to watch in the store
 * @returns Svelte readable store
 */
export function createAnyStateReadable<T = any>(store: AnyStateStore, path: TPath) {
  const initialValue = store.getItem(path);
  
  return readable<T>(initialValue, (set) => {
    const unwatch = store.watch(path as string, (newValue) => {
      set(newValue);
    });
    
    // Return cleanup function
    return () => {
      unwatch();
    };
  });
}