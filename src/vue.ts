import { ref, onMounted, onUnmounted, computed, Ref } from 'vue';
import type { Key, TPath } from './type';

interface AnyStateStore {
  getItem: (path: TPath) => any;
  setItem: (path: TPath, value: any) => void;
  watch: (path: string, callback: (newValue: any, oldValue: any) => void) => () => void;
}

/**
 * Vue composable for anyState integration
 * @param store - The anyState store instance
 * @param path - The path to watch in the store
 * @returns Reactive ref and setter function
 */
export function useAnyState<T = any>(store: AnyStateStore, path: TPath): [Ref<T>, (value: T) => void] {
  const value = ref<T>(store.getItem(path)) as Ref<T>;
  let unwatch: (() => void) | null = null;

  onMounted(() => {
    unwatch = store.watch(path as string, (newValue) => {
      value.value = newValue;
    });
  });

  onUnmounted(() => {
    if (unwatch) {
      unwatch();
    }
  });

  const setValue = (newValue: T) => store.setItem(path, newValue);

  return [value, setValue];
}

/**
 * Vue composable for multiple anyState values
 * @param store - The anyState store instance
 * @param paths - Object with keys as property names and values as paths to watch
 * @returns Reactive object with all values and setters
 */
export function useAnyStateMultiple<T extends Record<string, any>>(
  store: AnyStateStore, 
  paths: Record<keyof T, TPath>
): T & { [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void } {
  const values = {} as any;
  const unwatchers: (() => void)[] = [];

  // Create reactive refs for each path
  for (const key in paths) {
    const path = paths[key];
    const valueRef = ref(store.getItem(path));
    values[key] = valueRef;

    // Create setter function
    const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
    values[setterName] = (newValue: any) => store.setItem(path, newValue);
  }

  onMounted(() => {
    // Set up watchers for each path
    for (const key in paths) {
      const path = paths[key];
      const valueRef = values[key];
      
      const unwatch = store.watch(path as string, (newValue) => {
        valueRef.value = newValue;
      });
      
      unwatchers.push(unwatch);
    }
  });

  onUnmounted(() => {
    // Clean up all watchers
    unwatchers.forEach(unwatch => unwatch());
  });

  return values;
}

/**
 * Vue composable that creates a computed property from store values
 * @param store - The anyState store instance
 * @param paths - Array of paths to watch
 * @param computeFn - Function to compute the derived value
 * @returns Computed ref
 */
export function useAnyStateComputed<T>(
  store: AnyStateStore,
  paths: TPath[],
  computeFn: (...values: any[]) => T
): Ref<T> {
  const watchedValues = paths.map(path => {
    const valueRef = ref(store.getItem(path)) as Ref<any>;
    
    onMounted(() => {
      const unwatch = store.watch(path as string, (newValue) => {
        valueRef.value = newValue;
      });
      
      onUnmounted(() => {
        unwatch();
      });
    });
    
    return valueRef;
  });

  return computed(() => {
    const values = watchedValues.map(ref => ref.value);
    return computeFn(...values);
  });
}