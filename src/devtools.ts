import type { Key } from './type';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
  }
}

type Action = {
  type: string;
  payload?: any;
};

type DevTools = {
  send: (action: Action, state: any) => void;
  subscribe: (listener: (message: any) => void) => () => void;
  init: (state: any) => void;
};

let devTools: DevTools | null = null;

export const connectDevTools = <T extends object>(
  initialState: T,
  setState: (newState: T) => void,
) => {
  if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
    if (devTools) {
      devTools.init(initialState);

      devTools.subscribe((message) => {
        if (message.type === 'DISPATCH' && message.payload.type === 'JUMP_TO_STATE') {
          setState(JSON.parse(message.state));
        }
      });
    }
  }
};

export const sendToDevTools = (action: string, state: any, payload?: any) => {
  if (devTools && devTools.send) {
    devTools.send({ type: action, payload }, state);
  }
};
