import type { AppData } from '../../domain/types';
import { defaultAppData } from '../../../data/seed';

const DB_NAME = '10k-forge-db';
const DB_VERSION = 2;
const STORE = 'app_state';
const KEY = 'current';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function mergeById<T extends { id: string }>(saved: T[] | undefined, latest: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of latest) map.set(item.id, item);
  for (const item of saved ?? []) map.set(item.id, { ...(map.get(item.id) ?? {} as T), ...item });
  return [...map.values()];
}

export function migrateAppData(saved: Partial<AppData> | undefined): AppData {
  if (!saved?.profile) return structuredClone(defaultAppData);
  return {
    ...structuredClone(defaultAppData),
    ...saved,
    schemaVersion: defaultAppData.schemaVersion,
    storageStatus: { ...defaultAppData.storageStatus, ...(saved.storageStatus ?? {}) },
    profile: { ...defaultAppData.profile, ...saved.profile },
    equipment: mergeById(saved.equipment, defaultAppData.equipment),
    exercises: mergeById(saved.exercises, defaultAppData.exercises),
    sessions: mergeById(saved.sessions, defaultAppData.sessions),
    plan: saved.plan?.days?.length ? { ...defaultAppData.plan, ...saved.plan } : structuredClone(defaultAppData.plan),
    sessionLogs: saved.sessionLogs ?? {},
    exerciseLogs: saved.exerciseLogs ?? {},
    runLogs: saved.runLogs ?? {}
  };
}

export async function requestPersistentStorage(data?: AppData): Promise<AppData | undefined> {
  if (!navigator.storage?.persist) return data;
  const granted = await navigator.storage.persist();
  if (!data) return undefined;
  const next = {
    ...data,
    storageStatus: {
      persistentRequested: true,
      persistentGranted: granted,
      checkedAt: new Date().toISOString()
    }
  };
  await saveAppData(next);
  return next;
}

export async function loadAppData(): Promise<AppData> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(migrateAppData(req.result));
    req.onerror = () => reject(req.error);
  });
}

export async function saveAppData(data: AppData): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(migrateAppData(data), KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function resetAppData(): Promise<AppData> {
  const next = structuredClone(defaultAppData);
  await saveAppData(next);
  return next;
}
