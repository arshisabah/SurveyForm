const NS = 'smart-survey-platform';

export const storage = {
  get(key, fallback) {
    const raw = localStorage.getItem(`${NS}:${key}`);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  }
};
