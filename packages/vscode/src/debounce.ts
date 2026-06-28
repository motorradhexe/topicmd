/**
 * Tiny trailing-debounce helpers used to coalesce VS Code event storms (keystroke
 * changes, rapid index writes) so expensive work runs once the activity settles.
 */

/** Debounce a no-arg callback. `cancel()` clears any pending call (call on dispose). */
export function debounce(
  fn: () => void,
  delayMs: number,
): { run: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    run() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        fn();
      }, delayMs);
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = undefined;
    },
  };
}

/**
 * Debounce per string key, carrying the latest value for each key. Useful for
 * per-document work where many documents change independently.
 */
export function keyedDebounce<V>(
  fn: (value: V) => void,
  delayMs: number,
): { run: (key: string, value: V) => void; cancel: (key: string) => void; cancelAll: () => void } {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  return {
    run(key, value) {
      const existing = timers.get(key);
      if (existing) clearTimeout(existing);
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          fn(value);
        }, delayMs),
      );
    },
    cancel(key) {
      const t = timers.get(key);
      if (t) clearTimeout(t);
      timers.delete(key);
    },
    cancelAll() {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    },
  };
}
