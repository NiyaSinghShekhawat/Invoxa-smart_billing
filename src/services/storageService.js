const PREFIX = "rcr_staff_";

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(`${PREFIX}prefs`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(`${PREFIX}prefs`, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}
