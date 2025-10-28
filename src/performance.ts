export const trackPerformance = <T extends (...args: any[]) => any>(
  fnName: string,
  fn: T,
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${fnName} took ${end - start}ms`);
    return result;
  };
};

export const trackMemory = (state: object) => {
  const memoryUsage = new TextEncoder().encode(JSON.stringify(state)).length;
  console.log(`State memory usage: ${memoryUsage} bytes`);
};
