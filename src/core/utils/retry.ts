export function retry<T>(
  fn: (...args: any) => Promise<T>,
  retriesLeft: number,
  interval: number,
  onError?: (retriesLeft: number, error?: any) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error: any) => {
        if (onError) {
          onError(retriesLeft, error);
        }
        setTimeout(() => {
          if (retriesLeft <= 1) {
            reject(error);
            return;
          }
          retry(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
}
