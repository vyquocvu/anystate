import type { Middleware } from './type';

export const applyMiddleware = <T extends object>(
  middlewares: Middleware<T>[],
  getState: () => T | null
) => {
  return (fn: (...args: any[]) => void) => {
    return (...args: any[]) => {
      const composed: (...args: any[]) => void = middlewares.reduceRight(
        (next, middleware) => {
          return (...a: any[]) => {
            const state = getState();
            if (state) {
              (middleware as any).apply(null, [state, next].concat(a));
            }
          };
        },
        fn
      );
      composed(...args);
    };
  };
};
