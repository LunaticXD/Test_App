// IndexedDB Persistence Engine for User Uploaded Soundtracks

const DB_NAME = 'taskorbit_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'soundtracks';
const KEY = 'active_soundtrack';

export interface StoredTrackData {
  blob: Blob;
  name: string;
  type: string;
  size: number;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

export async function saveSoundtrackToIndexedDB(file: File): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredTrackData = {
      blob: file,
      name: file.name,
      type: file.type || 'audio/mpeg',
      size: file.size,
      updatedAt: Date.now(),
    };

    store.put(record, KEY);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  } catch (err) {
    console.error('Failed to save soundtrack to IndexedDB:', err);
  }
}

export async function loadSoundtrackFromIndexedDB(): Promise<StoredTrackData | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(KEY);

    return new Promise((resolve) => {
      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Failed to load soundtrack from IndexedDB:', err);
    return null;
  }
}

export async function deleteSoundtrackFromIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(KEY);
  } catch (err) {
    console.error('Failed to delete soundtrack from IndexedDB:', err);
  }
}
