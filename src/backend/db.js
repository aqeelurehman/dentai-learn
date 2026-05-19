/**
 * backend/db.js
 * Persistent key-value store backed by window.storage (Claude artifact storage).
 * Falls back to an in-memory store when running locally / in development.
 */

const memStore = {};
const LS_PREFIX = "dentpath_";

function hasLocalStorage() {
  try { localStorage.setItem("__test", "1"); localStorage.removeItem("__test"); return true; } catch { return false; }
}

const useLS = typeof window !== "undefined" && hasLocalStorage();

const DB = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.storage) {
        const r = await window.storage.get(key);
        return r ? JSON.parse(r.value) : null;
      }
      if (useLS) {
        const v = localStorage.getItem(LS_PREFIX + key);
        return v ? JSON.parse(v) : null;
      }
      return memStore[key] ?? null;
    } catch {
      return memStore[key] ?? null;
    }
  },

  async set(key, val) {
    try {
      const str = JSON.stringify(val);
      memStore[key] = val;
      if (typeof window !== "undefined" && window.storage) {
        await window.storage.set(key, str);
      }
      if (useLS) {
        localStorage.setItem(LS_PREFIX + key, str);
      }
      return true;
    } catch {
      return false;
    }
  },

  async del(key) {
    try {
      delete memStore[key];
      if (typeof window !== "undefined" && window.storage) {
        await window.storage.delete(key);
      }
      if (useLS) {
        localStorage.removeItem(LS_PREFIX + key);
      }
      return true;
    } catch {
      return false;
    }
  },

  async list(prefix) {
    try {
      if (typeof window !== "undefined" && window.storage) {
        const r = await window.storage.list(prefix);
        return r?.keys || [];
      }
      if (useLS) {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k.startsWith(LS_PREFIX + prefix)) keys.push(k.slice(LS_PREFIX.length));
        }
        return keys;
      }
      return Object.keys(memStore).filter(k => k.startsWith(prefix));
    } catch {
      return [];
    }
  },
};

export default DB;
