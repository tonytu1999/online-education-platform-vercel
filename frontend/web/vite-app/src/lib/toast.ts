// Lightweight module-level toast — avoids prop-drilling for one-liner "coming soon" messages.
let _set: ((msg: string | null) => void) | null = null;
let _timer: ReturnType<typeof setTimeout> | null = null;

export function registerToast(fn: (msg: string | null) => void) {
  _set = fn;
}

export function showToast(msg: string, durationMs = 2800) {
  if (!_set) return;
  if (_timer) clearTimeout(_timer);
  _set(msg);
  _timer = setTimeout(() => { _set?.(null); _timer = null; }, durationMs);
}