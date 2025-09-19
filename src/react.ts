import { useState, useEffect } from 'react';
import type { Key, TPath } from './type';

interface AnyStateStore {
  getItem: (path: TPath) => any;
  setItem: (path: TPath, value: any) => void;
  watch: (path: string, callback: (newValue: any, oldValue: any) => void) => () => void;
}

/**
 * React hook for anyState integration
 * @param store - The anyState store instance
 * @param path - The path to watch in the store
 * @returns [value, setValue] tuple similar to useState
 */
export function useAnyState<T = any>(store: AnyStateStore, path: TPath): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => store.getItem(path));
  
  useEffect(() => {
    return store.watch(path as string, (newValue) => setValue(newValue));
  }, [store, path]);
  
  const updateValue = (newValue: T) => store.setItem(path, newValue);
  
  return [value, updateValue];
}

/**
 * React hook for multiple anyState values
 * @param store - The anyState store instance
 * @param paths - Object with keys as property names and values as paths to watch
 * @returns Object with the same keys but values from the store
 */
export function useAnyStateMultiple<T extends Record<string, any>>(
  store: AnyStateStore, 
  paths: Record<keyof T, TPath>
): T & { [K in keyof T]: (value: T[K]) => void } {
  const result = {} as any;
  
  for (const key in paths) {
    const [value, setValue] = useAnyState(store, paths[key]);
    result[key] = value;
    result[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] = setValue;
  }
  
  return result;
}