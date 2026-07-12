/**
 * Storage utility that works around Figma Make's iframe storage limitations.
 *
 * The issue: localStorage in Figma Make iframes is cleared on page refresh.
 * Solution: Use IndexedDB for persistent storage, with localStorage as a cache.
 */

interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

class IndexedDBAdapter implements StorageAdapter {
  private dbName = 'AQMS_DB';
  private storeName = 'storage';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result ?? null);
      });
    } catch (e) {
      console.error('[IndexedDB] getItem error:', e);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (e) {
      console.error('[IndexedDB] setItem error:', e);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (e) {
      console.error('[IndexedDB] removeItem error:', e);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (e) {
      console.error('[IndexedDB] clear error:', e);
    }
  }
}

class PersistentStorage {
  private adapter: StorageAdapter;
  private cache: Map<string, string> = new Map();

  constructor() {
    this.adapter = new IndexedDBAdapter();
  }

  async getItem(key: string): Promise<string | null> {
    // Try cache first
    if (this.cache.has(key)) {
      return this.cache.get(key) || null;
    }

    // Try IndexedDB
    const value = await this.adapter.getItem(key);
    if (value) {
      this.cache.set(key, value);
    }
    return value;
  }

  async setItem(key: string, value: string): Promise<void> {
    // Update cache
    this.cache.set(key, value);

    // Save to IndexedDB
    await this.adapter.setItem(key, value);

    // Also try localStorage as a backup (even though it won't persist)
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[Storage] localStorage.setItem failed:', e);
    }
  }

  async removeItem(key: string): Promise<void> {
    this.cache.delete(key);
    await this.adapter.removeItem(key);
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('[Storage] localStorage.removeItem failed:', e);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    await this.adapter.clear();
    try {
      // Only clear aqms_* keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('aqms_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('[Storage] localStorage.clear failed:', e);
    }
  }

  // Synchronous methods for backward compatibility (uses cache)
  getItemSync(key: string): string | null {
    return this.cache.get(key) || null;
  }

  setItemSync(key: string, value: string): void {
    this.cache.set(key, value);
    // Fire and forget async save
    this.setItem(key, value).catch((e) =>
      console.error('[Storage] Async setItem failed:', e)
    );
  }
}

// Singleton instance
export const storage = new PersistentStorage();

// Helper functions that match localStorage API
export async function getStorageItem(key: string): Promise<string | null> {
  return storage.getItem(key);
}

export async function setStorageItem(
  key: string,
  value: string
): Promise<void> {
  return storage.setItem(key, value);
}

export async function removeStorageItem(key: string): Promise<void> {
  return storage.removeItem(key);
}

export async function clearStorage(): Promise<void> {
  return storage.clear();
}

// Synchronous helpers (use in-memory cache)
export function getStorageItemSync(key: string): string | null {
  return storage.getItemSync(key);
}

export function setStorageItemSync(key: string, value: string): void {
  storage.setItemSync(key, value);
}
