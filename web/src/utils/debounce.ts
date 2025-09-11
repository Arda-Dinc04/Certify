/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a debounced version of an async function
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  let latestPromise: Promise<ReturnType<T>> | null = null;

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      const later = async () => {
        timeout = null;
        try {
          const result = await func(...args);
          if (latestPromise === currentPromise) {
            resolve(result);
          }
        } catch (error) {
          if (latestPromise === currentPromise) {
            reject(error);
          }
        }
      };

      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
      
      const currentPromise = new Promise<ReturnType<T>>((res, rej) => {
        timeout = setTimeout(async () => {
          try {
            const result = await func(...args);
            res(result);
          } catch (error) {
            rej(error);
          }
        }, wait);
      });
      
      latestPromise = currentPromise;
    });
  };
}

/**
 * Throttle function to ensure a function is called at most once per specified interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}