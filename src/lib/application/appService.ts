import type { AppData, Exercise, ExerciseLog, Plan, PlannedDay, RunLog, SessionLog, WorkoutSession } from '../domain/types';

export function todayIso(date = new Date()): string { return date.toISOString().slice(0, 10); }
export function uid(prefix = 'id'): string { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

export function getTodayPlan(data: AppData): PlannedDay {
  const today = todayIso();
  return data.plan.days.find(d => d.date === today) ?? data.plan.days.find(d => !isCompleted(data, d)) ?? data.plan.days[data.plan.days.length - 1];
}

export function getSession(data: AppData, sessionId: string): WorkoutSession {
  return data.sessions.find(s => s.id === sessionId) ?? data.sessions[0];
}

export function getExercise(data: AppData, exerciseId: string): Exercise | undefined {
  return data.exercises.find(e => e.id === exerciseId);
}

export function isCompleted(data: AppData, day: PlannedDay): boolean {
  return Object.values(data.sessionLogs).some(l => l.scheduledDate === day.date && l.sessionId === day.sessionId && l.status === 'completed');
}

export function daysUntil(dateIso: string): number {
  const start = new Date(todayIso()).getTime();
  const end = new Date(dateIso).getTime();
  return Math.max(0, Math.ceil((end - start) / 86400000));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function formatPace(secondsPerKm: number): string {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return '—';
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60).toString().padStart(2, '0');
  return `${m}:${s}/km`;
}

export function sessionStats(data: AppData) {
  const now = new Date(todayIso());
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
  const inWeek = (d:string) => new Date(d) >= weekStart && new Date(d) <= weekEnd;
  const planned = data.plan.days.filter(d => inWeek(d.date) && getSession(data, d.sessionId).type !== 'rest');
  const done = Object.values(data.sessionLogs).filter(l => inWeek(l.scheduledDate) && l.status === 'completed');
  const runs = Object.values(data.runLogs).filter(r => inWeek(r.date));
  const totalKm = runs.reduce((sum, r) => sum + r.distanceKm, 0);
  const longest = runs.reduce((max, r) => Math.max(max, r.distanceKm), 0);
  const avgPace = runs.length ? runs.reduce((sum, r) => sum + r.paceSecondsPerKm, 0) / runs.length : 0;
  const painCount = Object.values(data.sessionLogs).filter(l => l.pain).length;
  const avgEffort = done.length ? Math.round(done.reduce((sum, l) => sum + l.effort, 0) / done.length) : 0;
  return { plannedCount: planned.length, doneCount: done.length, runCount: runs.length, totalKm, longest, avgPace, painCount, avgEffort };
}

export function readinessMessage(data: AppData): {label:string; tone:'ok'|'warn'|'danger'} {
  const lastTwo = Object.values(data.sessionLogs).slice(-2);
  if (lastTwo.some(l => l.pain)) return { label:'Pain logged — choose recovery or mobility.', tone:'danger' };
  if (lastTwo.length === 2 && lastTwo.every(l => l.effort >= 9)) return { label:'High fatigue — reduce intensity today.', tone:'warn' };
  if (data.profile.staminaLevel === 'low') return { label:'Build slowly — consistency beats hard suffering.', tone:'ok' };
  return { label:'On track — train controlled, not reckless.', tone:'ok' };
}

export function completeSession(data: AppData, input: { sessionId:string; scheduledDate:string; durationSeconds:number; effort:number; energyAfter:'low'|'normal'|'good'; pain:boolean; notes?:string }): AppData {
  const log: SessionLog = { id: uid('session'), planId:data.plan.id, status:'completed', completedAt:new Date().toISOString(), ...input };
  return { ...data, sessionLogs: { ...data.sessionLogs, [log.id]: log } };
}

export function completeSessionWithExercises(
  data: AppData,
  input: { sessionId:string; scheduledDate:string; durationSeconds:number; effort:number; energyAfter:'low'|'normal'|'good'; pain:boolean; notes?:string },
  exerciseInputs: Omit<ExerciseLog, 'id' | 'sessionLogId'>[]
): AppData {
  const sessionId = uid('session');
  const log: SessionLog = { id: sessionId, planId:data.plan.id, status:'completed', completedAt:new Date().toISOString(), ...input };
  const logs: ExerciseLog[] = exerciseInputs
    .filter(item => item.completed || item.reps || item.weightKg || item.durationSeconds || item.notes)
    .map(item => ({ id: uid('exercise'), sessionLogId: sessionId, ...item }));
  
  const newExerciseLogs = { ...data.exerciseLogs };
  for (const l of logs) newExerciseLogs[l.id] = l;
  
  return { ...data, sessionLogs: { ...data.sessionLogs, [log.id]: log }, exerciseLogs: newExerciseLogs };
}

export function logRun(data: AppData, input: Omit<RunLog,'id'|'paceSecondsPerKm'>): AppData {
  const paceSecondsPerKm = input.durationSeconds / Math.max(input.distanceKm, 0.01);
  const newRun = { id: uid('run'), paceSecondsPerKm, ...input };
  return { ...data, runLogs: { ...data.runLogs, [newRun.id]: newRun } };
}

export function logWeight(data: AppData, weightKg: number): AppData {
  const date = todayIso();
  const existingLog = Object.values(data.weightLogs).find(w => w.date === date);
  const newLog = { id: existingLog ? existingLog.id : uid('weight'), date, weightKg };
  return { ...data, profile: { ...data.profile, bodyWeightKg: weightKg }, weightLogs: { ...data.weightLogs, [newLog.id]: newLog } };
}


export function exportJson(data: AppData): string {
  return JSON.stringify({ exportedAt:new Date().toISOString(), app:'10K Forge', version:data.schemaVersion, data }, null, 2);
}

export function targetFor(exercise: Exercise, level = 'improver') {
  return exercise.targets.find(t => t.level === level) ?? exercise.targets[0];
}

export function latestExerciseLog(data: AppData, exerciseId: string): ExerciseLog | undefined {
  return Object.values(data.exerciseLogs).reverse().find(log => log.exerciseId === exerciseId);
}

export function personalBestText(data: AppData, exerciseId: string): string {
  const exercise = getExercise(data, exerciseId);
  if (!exercise) return '—';
  if (exercise.category === 'run') {
    const runs = Object.values(data.runLogs);
    const longest = runs.reduce((max, run) => Math.max(max, run.distanceKm), 0);
    const bestPace = runs.reduce((best, run) => Math.min(best, run.paceSecondsPerKm), Number.POSITIVE_INFINITY);
    return longest ? `${longest.toFixed(1)} km best · ${formatPace(bestPace)}` : 'No run logged yet';
  }
  const logs = Object.values(data.exerciseLogs).filter(log => log.exerciseId === exerciseId);
  if (!logs.length) return 'No log yet';
  const maxReps = Math.max(...logs.map(log => log.reps ?? 0));
  const maxWeight = Math.max(...logs.map(log => log.weightKg ?? 0));
  const maxDuration = Math.max(...logs.map(log => log.durationSeconds ?? 0));
  const parts = [];
  if (maxReps) parts.push(`${maxReps} reps`);
  if (maxWeight) parts.push(`${maxWeight}kg`);
  if (maxDuration) parts.push(formatDuration(maxDuration));
  return parts.join(' · ') || 'Completed';
}

export function keyAchievementRows(data: AppData) {
  const ids = ['easy-run','long-run','push-up','goblet-squat','abs-wheel','plank','jump-rope','kettlebell-around-the-world','one-arm-row','farmer-carry-march'];
  return ids.map(id => {
    const exercise = getExercise(data, id)!;
    const target = targetFor(exercise, data.profile.targetLevel);
    return { exercise, target, current: personalBestText(data, id) };
  }).filter(row => row.exercise);
}

export function expected10kGuidance(data: AppData): string {
  const runs = Object.values(data.runLogs);
  const longest = runs.reduce((max, run) => Math.max(max, run.distanceKm), 0);
  const recentPace = runs.slice(-3).filter(r => r.distanceKm >= 3);
  const avg = recentPace.length ? recentPace.reduce((sum, r) => sum + r.paceSecondsPerKm, 0) / recentPace.length : 0;
  if (!longest) return 'First target: log 4–5km easy run. Expected 10K pace will appear after runs.';
  if (longest < 6) return 'Current 10K expectation: finish-first strategy. Use run/walk if needed. Build one 6–7km slow run.';
  if (longest < 8) return `Current 10K expectation: controlled finish. Estimated safe pace around ${formatPace(avg || 480)} to ${formatPace((avg || 480) + 45)}.`;
  return `Current 10K expectation: ready to finish. Start near ${formatPace((avg || 450) + 20)}, then only speed up after 7km.`;
}

export function generatePostRacePlan(data: AppData, newRaceDate: string, targetLabel: string): AppData {
  const start = new Date(todayIso());
  start.setDate(start.getDate() + 1);
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const pattern = ['lower-body-hiit','easy-run-5k','upper-body-hiit','core-hiit','long-run-w2','mobility-kb','rest'];
  const days: PlannedDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, dayName: dayNames[d.getDay()], sessionId: pattern[i % pattern.length] });
  }
  const plan: Plan = {
    id: `custom-plan-${Date.now()}`,
    name: targetLabel || 'Next 6-week 10K Forge Plan',
    version: 1,
    raceDate: newRaceDate,
    targetLabel: targetLabel || 'Build next level after race',
    days
  };
  return { ...data, profile: { ...data.profile, raceDate: newRaceDate, goal: targetLabel || data.profile.goal }, plan };
}
