type CacheValue = string | null; // Define the type for values stored in cache
type JSONValue = Record<string, unknown> | null; // Define the type for JSON objects

const sessionCache = {
  set(key: string, value: string): void {
    if (!sessionStorage) {
      return;
    }
    if (key !== null && value !== null) {
      sessionStorage.setItem(key, value);
    }
  },
  get(key: string): CacheValue {
    if (!sessionStorage) {
      return null;
    }
    if (key === null) {
      return null;
    }
    return sessionStorage.getItem(key);
  },
  setJSON(key: string, jsonValue: JSONValue): void {
    if (jsonValue !== null) {
      this.set(key, JSON.stringify(jsonValue));
    }
  },
  getJSON(key: string): JSONValue {
    const value = this.get(key);
    if (value !== null) {
      return JSON.parse(value);
    }
    return null;
  },
  remove(key: string): void {
    if (!sessionStorage) {
      return;
    }
    sessionStorage.removeItem(key);
  },
};

const localCache = {
  set(key: string, value: string): void {
    if (!localStorage) {
      return;
    }
    if (key !== null && value !== null) {
      localStorage.setItem(key, value);
    }
  },
  get(key: string): CacheValue {
    if (!localStorage) {
      return null;
    }
    if (key === null) {
      return null;
    }
    return localStorage.getItem(key);
  },
  setJSON(key: string, jsonValue: JSONValue): void {
    if (jsonValue !== null) {
      this.set(key, JSON.stringify(jsonValue));
    }
  },
  getJSON(key: string): JSONValue {
    const value = this.get(key);
    if (value !== null) {
      return JSON.parse(value);
    }
    return null;
  },
  remove(key: string): void {
    if (!localStorage) {
      return;
    }
    localStorage.removeItem(key);
  },
};

export default {
  /**
   * Session-level caching
   */
  session: sessionCache,
  /**
   * Local caching
   */
  local: localCache,
};