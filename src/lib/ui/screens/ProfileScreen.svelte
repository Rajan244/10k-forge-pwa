<script lang="ts">
  import { get } from 'svelte/store';
  import { appData, enablePersistentStorage, resetApp } from '../stores/appStore';
  import { exportJson, generatePostRacePlan, logWeight } from '../../application/appService';
  import { ShieldCheck, User, Settings as SettingsIcon, CalendarDays, Zap, Bell, Database, Info } from 'lucide-svelte';

  let importText = '';
  let message = '';
  let newTargetDate = '2026-08-01';
  let newTargetLabel = 'Next 10K improvement block';
  let tempWeight = $appData.profile.bodyWeightKg;

  function updateWeight() {
    appData.set(logWeight(get(appData), tempWeight));
    message = 'Body weight logged successfully.';
  }

  function downloadBackup() {
    const blob = new Blob([exportJson(get(appData))], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `10k-forge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup() {
    try {
      const parsed = JSON.parse(importText);
      appData.set(parsed.data ?? parsed);
      message = 'Backup imported.';
    } catch {
      message = 'Import failed. Paste a valid 10K Forge JSON backup.';
    }
  }

  async function protectStorage() {
    await enablePersistentStorage();
    message = $appData.storageStatus.persistentGranted
      ? 'Persistent storage requested. Your phone/browser should avoid clearing this app data automatically.'
      : 'Persistent storage was requested. This browser may still manage storage automatically, so export backups regularly.';
  }

  async function askNotification() {
    if (!('Notification' in window)) {
      message = 'Notifications are not supported in this browser.';
      return;
    }
    const permission = await Notification.requestPermission();
    message = permission === 'granted' ? 'Notifications allowed. Browser support varies for local scheduled reminders.' : 'Notifications not allowed.';
    if (permission === 'granted') new Notification('10K Forge', { body: 'Reminder enabled. Today’s training will show inside the app.' });
  }

  function createNextPlan() {
    appData.set(generatePostRacePlan(get(appData), newTargetDate, newTargetLabel));
    message = 'New target plan created. Your old logs are kept.';
  }

  function refreshApp() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(r => r.update());
      });
    }
    setTimeout(() => window.location.reload(), 500);
  }
</script>

<div class="py-6 space-y-6">
  <!-- Header -->
  <div class="animate-fade-in-up">
    <h1 class="text-2xl font-bold">Settings</h1>
    <p class="text-sm text-muted-foreground mt-0.5">Personal setup</p>
  </div>

  {#if message}
    <div class="animate-fade-in-up rounded-xl bg-primary/20 border border-primary/30 p-4 text-sm text-primary">
      {message}
    </div>
  {/if}

  <!-- Body Profile -->
  <div class="glass-card rounded-2xl p-5 space-y-4 animate-fade-in-up" style="animation-delay: 50ms;">
    <div class="flex items-center gap-2">
      <User class="w-4 h-4 text-primary" />
      <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Body Profile</h3>
    </div>
    
    <div class="space-y-4">
      <div class="space-y-1.5">
        <span class="text-xs font-medium text-muted-foreground">Body Weight (kg)</span>
        <div class="flex gap-2">
          <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" type="number" step="0.5" bind:value={tempWeight}>
          <button class="flex items-center justify-center rounded-md bg-secondary/50 border border-border/50 px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors" on:click={updateWeight}>Log</button>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <label class="space-y-1.5">
          <span class="text-xs font-medium text-muted-foreground">Lifestyle</span>
          <select class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={$appData.profile.lifestyle}>
            <option value="desk_it">Desk / IT work</option>
            <option value="mixed">Mixed</option>
            <option value="active">Active</option>
          </select>
        </label>
        
        <label class="space-y-1.5">
          <span class="text-xs font-medium text-muted-foreground">Diet</span>
          <select class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={$appData.profile.dietQuality}>
            <option value="needs_work">Needs work</option>
            <option value="partial_healthy">Partially healthy</option>
            <option value="strong">Strong</option>
          </select>
        </label>

        <label class="space-y-1.5">
          <span class="text-xs font-medium text-muted-foreground">Target Level</span>
          <select class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={$appData.profile.targetLevel}>
            <option value="beginner">Beginner</option>
            <option value="improver">Improver</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        
        <label class="space-y-1.5">
          <span class="text-xs font-medium text-muted-foreground">Stamina</span>
          <select class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={$appData.profile.staminaLevel}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
    </div>
  </div>

  <!-- Goal Setup -->
  <div class="glass-card rounded-2xl p-5 space-y-4 animate-fade-in-up" style="animation-delay: 100ms;">
    <div class="flex items-center gap-2">
      <SettingsIcon class="w-4 h-4 text-primary" />
      <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Race Goal</h3>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <label class="space-y-1.5">
        <span class="text-xs font-medium text-muted-foreground">Race Date</span>
        <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" type="date" bind:value={$appData.profile.raceDate}>
      </label>
      <label class="space-y-1.5">
        <span class="text-xs font-medium text-muted-foreground">Reminder</span>
        <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" type="time" bind:value={$appData.profile.reminderTime}>
      </label>
    </div>
    
    <label class="space-y-1.5 block">
      <span class="text-xs font-medium text-muted-foreground">Goal Statement</span>
      <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={$appData.profile.goal}>
    </label>
  </div>

  <!-- Create Next Plan -->
  <div class="glass-card rounded-2xl p-5 space-y-4 animate-fade-in-up" style="animation-delay: 150ms;">
    <div class="flex items-center gap-2">
      <CalendarDays class="w-4 h-4 text-primary" />
      <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">After Race Day</h3>
    </div>
    <p class="text-[10px] text-muted-foreground leading-relaxed">Use this to generate a new 6-week block while keeping your history.</p>
    
    <div class="grid grid-cols-2 gap-4">
      <label class="space-y-1.5">
        <span class="text-xs font-medium text-muted-foreground">New Target Date</span>
        <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" type="date" bind:value={newTargetDate}>
      </label>
      <label class="space-y-1.5">
        <span class="text-xs font-medium text-muted-foreground">Target Name</span>
        <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={newTargetLabel}>
      </label>
    </div>
    
    <button class="flex w-full items-center justify-center rounded-xl bg-secondary/50 border border-border/50 px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary active:scale-[0.98]" on:click={createNextPlan}>
      Create Next Plan
    </button>
  </div>

  <!-- Equipment -->
  <div class="glass-card rounded-2xl p-5 space-y-4 animate-fade-in-up" style="animation-delay: 200ms;">
    <div class="flex items-center gap-2">
      <Zap class="w-4 h-4 text-primary" />
      <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Kit</h3>
    </div>
    
    <div class="flex flex-wrap gap-2">
      {#each $appData.equipment as eq}
        <span class="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
          {eq.name}{eq.weightKg ? ` · ${eq.weightKg}kg` : ''}
        </span>
      {/each}
    </div>
  </div>

  <!-- Data Management -->
  <div class="glass-card rounded-2xl p-5 space-y-4 animate-fade-in-up" style="animation-delay: 250ms;">
    <div class="flex items-center gap-2">
      <Database class="w-4 h-4 text-primary" />
      <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Data Management</h3>
    </div>
    
    <p class="text-[10px] text-muted-foreground leading-relaxed">Your data is stored locally in IndexedDB. Normal phone restarts will not delete it, but clearing browser data will.</p>

    <div class="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-background/50 rounded-lg p-2 border border-border/50">
      <ShieldCheck class="w-3.5 h-3.5 text-accent" />
      <span>Persistent Storage Granted: {$appData.storageStatus.persistentGranted ? 'Yes' : 'No'}</span>
    </div>

    <button class="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow glow-primary transition-all active:scale-[0.98]" on:click={downloadBackup}>
      Export My Data (Backup)
    </button>
    
    <div class="border-t border-border/50 border-dashed my-2"></div>
    
    <label class="space-y-1.5 block mb-4">
      <span class="text-xs font-medium text-muted-foreground">Import Backup JSON</span>
      <textarea class="input-glass flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" rows="3" bind:value={importText}></textarea>
    </label>

    <button class="flex w-full items-center justify-center rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 active:scale-[0.98] mb-3" on:click={refreshApp}>
      Check for App Updates
    </button>
    
    <div class="flex gap-3">
      <button class="flex-1 flex items-center justify-center rounded-xl bg-secondary/50 border border-border/50 px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary active:scale-[0.98]" on:click={importBackup}>
        Import Data
      </button>
      
      <button class="flex-1 flex items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground active:scale-[0.98]" on:click={resetApp}>
        Reset App
      </button>
    </div>
  </div>
</div>
