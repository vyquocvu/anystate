export type Key = string | number;
export type TPath = Key | Key[];

export type WatchCallback = (newValue: any, oldValue: any) => void;
export type WatchObject = { [path: string]: WatchCallback };