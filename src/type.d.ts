export type Key = string | number;
export type TPath = Key | Key[];

export type WatchCallback<T = any> = (newValue: T, oldValue: T) => void;
export type WatchObject<T = any> = { [path: string]: WatchCallback<T> };