import { writable, derived, get } from 'svelte/store';
import type { AppData, TabId } from '../../domain/types';
import { loadAppData, requestPersistentStorage, saveAppData, resetAppData } from '../../infrastructure/db/indexedDb';
import { getSession, getTodayPlan, sessionStats, readinessMessage, keyAchievementRows } from '../../application/appService';
import { defaultAppData } from '../../../data/seed';

export const appData = writable<AppData>(structuredClone(defaultAppData));
const tabFromUrl = new URLSearchParams(location.search).get('tab');
const allowedTabs: TabId[] = ['home', 'start', 'dashboard', 'plan', 'profile'];
export const activeTab = writable<TabId>(allowedTabs.includes(tabFromUrl as TabId) ? tabFromUrl as TabId : 'home');
export const booted = writable(false);

export const todayPlan = derived(appData, data => getTodayPlan(data));
export const todaySession = derived(appData, data => getSession(data, getTodayPlan(data).sessionId));
export const dashboardStats = derived(appData, data => sessionStats(data));
export const readiness = derived(appData, data => readinessMessage(data));
export const achievementRows = derived(appData, data => keyAchievementRows(data));

let saveTimer: number | undefined;
appData.subscribe(data => {
  if (!data?.profile) return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveAppData(data).catch(console.error), 250);
});

export async function bootApp() {
  const loaded = await loadAppData();
  appData.set(loaded);
  booted.set(true);
}

export async function enablePersistentStorage() {
  const next = await requestPersistentStorage(get(appData));
  if (next) appData.set(next);
}

export async function resetApp() { appData.set(await resetAppData()); }
