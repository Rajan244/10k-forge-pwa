<script lang="ts">
  import { appData, dashboardStats, readiness, achievementRows } from '../stores/appStore';
  import { daysUntil, expected10kGuidance, formatPace } from '../../application/appService';
  import { Activity, BarChart2, Footprints, Target, CalendarDays, Weight, Trophy, Flame } from 'lucide-svelte';
  import LineChart from '../components/LineChart.svelte';

  $: runRows = Object.values($appData.runLogs).sort((a, b) => a.date.localeCompare(b.date)).slice(-6);
  $: runDistances = runRows.map(r => r.distanceKm);
  $: runLabels = runRows.map(r => r.date.split('-').slice(1).join('/'));
  $: runList = [...runRows].reverse();

  $: weightRows = Object.values($appData.weightLogs).sort((a, b) => a.date.localeCompare(b.date)).slice(-6);
  $: weightValues = weightRows.map(w => w.weightKg);
  $: weightLabels = weightRows.map(w => w.date.split('-').slice(1).join('/'));
  $: weightList = [...weightRows].reverse();
</script>

<div class="py-6 space-y-6">
  <!-- Header -->
  <div class="animate-fade-in-up">
    <h1 class="text-2xl font-bold">Progress</h1>
    <p class="text-sm text-muted-foreground mt-0.5">Am I improving?</p>
  </div>

  <!-- Hero / Dashboard Stats -->
  <div class="glass-card rounded-2xl p-6 relative overflow-hidden animate-fade-in-up" style="animation-delay: 50ms;">
    <div class="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
    <div class="relative z-10">
      <div class="mb-5 flex items-center justify-between gap-3">
        <span class="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary shadow">
          Race in {daysUntil($appData.profile.raceDate)} days
        </span>
        <span class="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-medium text-muted-foreground">
          {$appData.profile.bodyWeightKg}kg · {$appData.profile.lifestyle.replace('_', ' ')}
        </span>
      </div>
      
      <p class="mt-2 text-sm font-medium { $readiness.tone === 'danger' ? 'text-destructive' : $readiness.tone === 'warn' ? 'text-accent' : 'text-primary' }">
        {$readiness.label}
      </p>

      <div class="grid grid-cols-2 gap-4 mt-6">
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
            <Footprints class="w-3.5 h-3.5 text-primary" /> Total Distance
          </div>
          <strong class="text-2xl font-bold tracking-tight">{$dashboardStats.totalKm.toFixed(1)} km</strong>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
            <Trophy class="w-3.5 h-3.5 text-accent" /> Longest Run
          </div>
          <strong class="text-2xl font-bold tracking-tight">{$dashboardStats.longest.toFixed(1)} km</strong>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
            <Activity class="w-3.5 h-3.5 text-[hsl(var(--chart-3))]" /> Avg Pace
          </div>
          <strong class="text-2xl font-bold tracking-tight">{formatPace($dashboardStats.avgPace)}/km</strong>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
            <Flame class="w-3.5 h-3.5 text-[hsl(var(--chart-4))]" /> Runs Logged
          </div>
          <strong class="text-2xl font-bold tracking-tight">{$dashboardStats.runCount}</strong>
        </div>
      </div>
    </div>
  </div>

  <!-- Coach Answer -->
  <div class="glass-card rounded-2xl p-5 animate-fade-in-up" style="animation-delay: 100ms;">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">10K expectation</div>
        <h2 class="mt-1 text-lg font-semibold tracking-tight">Expected race pace</h2>
      </div>
      <Activity class="h-6 w-6 text-primary opacity-80" />
    </div>
    <p class="mb-3 text-sm font-medium leading-relaxed text-foreground">{expected10kGuidance($appData)}</p>
    <small class="block text-[10px] leading-relaxed text-muted-foreground">This is a conservative training guide, not a medical/performance guarantee.</small>
  </div>

  <!-- Targets -->
  <div class="glass-card rounded-2xl p-5 animate-fade-in-up" style="animation-delay: 150ms;">
    <div class="mb-5 flex items-start justify-between gap-3">
      <div>
        <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Exercise targets</div>
        <h2 class="mt-1 text-lg font-semibold tracking-tight">Current vs goal</h2>
      </div>
      <Target class="h-6 w-6 text-primary opacity-80" />
    </div>
    <div class="space-y-3">
      {#each $achievementRows as row}
        <div class="rounded-xl border border-border/50 bg-secondary/20 p-4">
          <div class="mb-3 flex flex-col gap-0.5">
            <strong class="text-sm font-semibold">{row.exercise.name}</strong>
            <small class="text-[10px] font-medium text-muted-foreground">{row.exercise.category} · {row.exercise.level}</small>
          </div>
          <div class="flex flex-col gap-1 text-xs">
            <p><span class="font-semibold text-foreground">Current:</span> <span class="text-muted-foreground">{row.current}</span></p>
            <p><span class="font-semibold text-foreground">Target:</span> <span class="text-primary">{row.target.targetText}</span></p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Progress Bars -->
  <div class="glass-card rounded-2xl p-5 animate-fade-in-up" style="animation-delay: 200ms;">
    <div class="mb-5 flex items-start justify-between gap-3">
      <div>
        <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Visual check</div>
        <h2 class="mt-1 text-lg font-semibold tracking-tight">Weekly bars</h2>
      </div>
      <BarChart2 class="h-6 w-6 text-primary opacity-80" />
    </div>
    
    <div class="mb-5">
      <div class="mb-2 flex justify-between text-xs font-medium">
        <span class="text-muted-foreground">Session completion</span>
        <strong class="text-foreground">{$dashboardStats.doneCount}/{$dashboardStats.plannedCount}</strong>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-muted/50 border border-border/50">
        <div class="h-full bg-primary transition-all duration-500 ease-in-out" style={`width:${Math.min(100, ($dashboardStats.doneCount / Math.max($dashboardStats.plannedCount, 1)) * 100)}%`}></div>
      </div>
    </div>
    
    <div>
      <div class="mb-2 flex justify-between text-xs font-medium">
        <span class="text-muted-foreground">Run target</span>
        <strong class="text-foreground">{$dashboardStats.runCount}/2</strong>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-muted/50 border border-border/50">
        <div class="h-full bg-accent transition-all duration-500 ease-in-out" style={`width:${Math.min(100, ($dashboardStats.runCount / 2) * 100)}%`}></div>
      </div>
    </div>
  </div>

  <!-- Run History -->
  <div class="glass-card rounded-2xl p-5 animate-fade-in-up" style="animation-delay: 250ms;">
    <div class="mb-5 flex items-start justify-between gap-3">
      <div>
        <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">History</div>
        <h2 class="mt-1 text-lg font-semibold tracking-tight">Recent runs</h2>
      </div>
      <Footprints class="h-6 w-6 text-primary opacity-80" />
    </div>
    {#if runList.length === 0}
      <p class="text-sm leading-relaxed text-muted-foreground">No runs logged yet. Your first run will appear here with distance, pace, breathing, and effort.</p>
    {:else}
      <div class="mb-6">
        <LineChart data={runDistances} labels={runLabels} color="hsl(var(--primary))" gradientId="runGrad" />
      </div>
      <div class="space-y-3">
        {#each runList as run}
          <div class="flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/20 p-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Footprints class="h-5 w-5" />
            </div>
            <div class="flex-1">
              <strong class="block text-sm font-semibold">{run.distanceKm.toFixed(1)} km · {formatPace(run.paceSecondsPerKm)}/km</strong>
              <p class="mt-0.5 text-[10px] text-muted-foreground leading-snug">
                {run.date} · breathing {run.breathing} · effort {run.effort}/10
              </p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Weight History -->
  <div class="glass-card rounded-2xl p-5 animate-fade-in-up" style="animation-delay: 300ms;">
    <div class="mb-5 flex items-start justify-between gap-3">
      <div>
        <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">History</div>
        <h2 class="mt-1 text-lg font-semibold tracking-tight">Weight logs</h2>
      </div>
      <Weight class="h-6 w-6 text-primary opacity-80" />
    </div>
    {#if weightList.length === 0}
      <p class="text-sm leading-relaxed text-muted-foreground">No weight logs yet. Update your profile baseline to see history.</p>
    {:else}
      <div class="mb-6">
        <LineChart data={weightValues} labels={weightLabels} color="hsl(var(--accent))" gradientId="weightGrad" />
      </div>
      <div class="space-y-3">
        {#each weightList as log}
          <div class="flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/20 p-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Weight class="h-5 w-5" />
            </div>
            <div class="flex-1">
              <strong class="block text-sm font-semibold">{log.weightKg} kg</strong>
              <p class="mt-0.5 text-[10px] text-muted-foreground leading-snug">{log.date}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
