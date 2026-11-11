const USER_KEY = "bloodlink_user";
const TOKEN_KEY = "bloodlink_token";

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

export function getStoredUser<T>(): T | null {
  const raw = readStorage(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown) {
  writeStorage(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  writeStorage(USER_KEY, null);
}

export function getStoredToken(): string | null {
  return readStorage(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  writeStorage(TOKEN_KEY, token);
}

export function clearStoredToken() {
  writeStorage(TOKEN_KEY, null);
}
