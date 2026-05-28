<script lang="ts">
  import { get } from 'svelte/store';
  import { onDestroy } from 'svelte';
  import { appData, todayPlan, todaySession } from '../stores/appStore';
  import { completeSession, completeSessionWithExercises, formatDuration, logRun, targetFor } from '../../application/appService';
  import type { Exercise, SessionItem } from '../../domain/types';
  import { Activity, CheckCircle2, Heart, Timer, Info, Play, Square, RotateCcw, FastForward, Volume2, VolumeX } from 'lucide-svelte';
  import ExerciseGuide from '../components/ExerciseGuide.svelte';

  let running = false;
  let finished = false;
  let currentName = '';
  let phase = 'Ready';
  let nextName = '';
  let remaining = 0;
  let currentPhaseTotal = 0;
  let total = 0;
  let tick: number | undefined;
  let effort = 7;
  let energyAfter: 'low' | 'normal' | 'good' = 'normal';
  let pain = false;
  let notes = '';
  let runDistance = 5;
  let runMinutes = 35;
  let breathing: 'good' | 'okay' | 'bad' = 'okay';
  let walkBreaks = 0;
  let selectedGuide: Exercise | null = null;
  let exerciseInputs: Record<string, { completed:boolean; sets:number; reps:number; weightKg:number; durationSeconds:number; notes:string }> = {};

  let isWork = true;
  let isPaused = false;
  let skipTrigger = false;
  let resetTrigger = false;
  
  let voiceEnabled = true;

  function speak(text: string) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  function trackableItems() {
    const seen = new Set<string>();
    return $todaySession.blocks.flatMap(block => block.items).filter(item => {
      const exercise = exerciseMap[item.exerciseId];
      if (!exercise || seen.has(item.exerciseId)) return false;
      seen.add(item.exerciseId);
      return exercise.tracking.reps || exercise.tracking.weight || exercise.tracking.duration;
    });
  }

  function ensureInput(exerciseId: string) {
    if (!exerciseInputs[exerciseId]) exerciseInputs[exerciseId] = { completed: true, sets: 1, reps: 0, weightKg: 0, durationSeconds: 0, notes: '' };
    return exerciseInputs[exerciseId];
  }

  $: exerciseMap = Object.fromEntries($appData.exercises.map((exercise) => [exercise.id, exercise]));
  $: isRun = $todaySession.type === 'run';
  $: currentExercise = $appData.exercises.find((exercise) => exercise.name === currentName) ?? null;
  $: nextExercise = $appData.exercises.find((exercise) => exercise.name === nextName) ?? null;

  $: timerProgress = currentPhaseTotal > 0 ? (remaining / currentPhaseTotal) : 0;
  $: dashoffset = 2 * Math.PI * 110 * (1 - timerProgress);

  // Warm-up completion
  $: warmupItems = $todaySession.blocks[0]?.items ?? [];
  let completedWarmups = new Set<number>();
  function toggleWarmup(index: number) {
    if (completedWarmups.has(index)) completedWarmups.delete(index);
    else completedWarmups.add(index);
    completedWarmups = completedWarmups;
  }
  $: allWarmupsDone = warmupItems.length > 0 && completedWarmups.size === warmupItems.length;

  function itemName(item: SessionItem) {
    return exerciseMap[item.exerciseId]?.name ?? item.exerciseId;
  }

  function guideFor(item: SessionItem): Exercise | null {
    return exerciseMap[item.exerciseId] ?? null;
  }

  function hasTutorial(item: SessionItem): boolean {
    const exercise = guideFor(item);
    return Boolean(exercise?.tutorial?.image || exercise?.tutorial?.video);
  }

  function allIntervals() {
    const out: { item: SessionItem; work: number; rest: number; round: number; rounds: number }[] = [];
    for (const block of $todaySession.blocks) {
      if (block.type === 'interval') {
        for (let r = 1; r <= (block.rounds ?? 1); r++) {
          for (const item of block.items) out.push({ item, work: block.workSeconds ?? item.durationSeconds ?? 40, rest: block.restSeconds ?? 15, round: r, rounds: block.rounds ?? 1 });
        }
      } else if (block.type === 'timer') {
        for (const item of block.items) out.push({ item, work: item.durationSeconds ?? 60, rest: 0, round: 1, rounds: 1 });
      }
    }
    return out;
  }

  async function startWorkout() {
    running = true;
    finished = false;
    isPaused = false;
    total = 0;
    const steps = allIntervals();
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      currentName = itemName(step.item);
      nextName = steps[i + 1] ? itemName(steps[i + 1].item) : 'Finish';
      phase = `Round ${step.round}/${step.rounds}`;
      isWork = true;
      currentPhaseTotal = step.work;
      
      speak(`Start ${currentName}`);
      
      await countdown(step.work);
      if (!running) return;
      total += (step.work - remaining);

      if (step.rest > 0) {
        currentName = 'Rest';
        nextName = steps[i + 1] ? itemName(steps[i + 1].item) : 'Finish';
        phase = 'Recover';
        isWork = false;
        currentPhaseTotal = step.rest;
        
        speak(`Rest. Next up: ${nextName}`);
        
        await countdown(step.rest);
        if (!running) return;
        total += (step.rest - remaining);
      }
    }
    speak("Workout complete. Well done!");
    running = false;
    finished = true;
  }

  function countdown(seconds: number) {
    remaining = seconds;
    skipTrigger = false;
    resetTrigger = false;
    return new Promise<void>((resolve) => {
      tick = window.setInterval(() => {
        if (resetTrigger) {
          remaining = seconds;
          resetTrigger = false;
        }
        if (skipTrigger) {
          remaining = 0;
        }
        if (!isPaused) {
          remaining -= 1;
          if (remaining === 3 || remaining === 2 || remaining === 1) {
            speak(remaining.toString());
          }
        }
        if (remaining <= 0) {
          window.clearInterval(tick);
          resolve();
        }
      }, 1000);
    });
  }

  function stop() {
    window.clearInterval(tick);
    running = false;
  }

  function togglePause() {
    isPaused = !isPaused;
  }

  onDestroy(() => {
    window.clearInterval(tick);
  });

  function saveSession() {
    const data = get(appData);
    const exerciseLogs = trackableItems().map(item => {
      const input = ensureInput(item.exerciseId);
      const exercise = exerciseMap[item.exerciseId];
      return {
        exerciseId: item.exerciseId,
        completed: input.completed,
        sets: exercise?.tracking.sets ? input.sets : undefined,
        reps: exercise?.tracking.reps ? input.reps || undefined : undefined,
        weightKg: exercise?.tracking.weight ? input.weightKg || undefined : undefined,
        durationSeconds: exercise?.tracking.duration ? input.durationSeconds || item.durationSeconds : undefined,
        effort,
        notes: input.notes || undefined
      };
    });
    appData.set(completeSessionWithExercises(data, { sessionId: $todaySession.id, scheduledDate: $todayPlan.date, durationSeconds: total || $todaySession.targetDurationMinutes * 60, effort, energyAfter, pain, notes }, exerciseLogs));
    finished = false;
    exerciseInputs = {};
  }

  function saveRun() {
    const seconds = Math.round(runMinutes * 60);
    let data = get(appData);
    data = logRun(data, { date: $todayPlan.date, runType: $todaySession.id.includes('long') ? 'long' : $todaySession.id.includes('race') ? 'race' : 'easy', distanceKm: runDistance, durationSeconds: seconds, effort, breathing, walkBreaks, notes });
    appData.set(completeSession(data, { sessionId: $todaySession.id, scheduledDate: $todayPlan.date, durationSeconds: seconds, effort, energyAfter, pain, notes }));
  }
</script>

<div class="py-6 space-y-6">
  <!-- Header Card -->
  <div class="glass-card rounded-2xl p-6 relative overflow-hidden animate-fade-in-up">
    <div class="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl"></div>
    <div class="relative z-10">
      <div class="mb-4 flex items-center justify-between gap-3">
        <span class="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent shadow">
          {$todayPlan.dayName}
        </span>
        <span class="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
          {$todayPlan.date}
        </span>
      </div>
      <div>
        <div class="text-xs font-semibold uppercase tracking-wider text-accent">Guided training</div>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-foreground leading-tight">{$todaySession.name}</h1>
        <p class="mt-2 text-sm text-muted-foreground leading-relaxed">{$todaySession.goal}</p>
      </div>
    </div>
  </div>

  {#if isRun}
    <div class="glass-card rounded-2xl p-5 animate-fade-in-up" style="animation-delay: 100ms;">
      <div class="mb-5 flex items-start justify-between gap-3">
        <div>
          <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Run day</div>
          <h2 class="mt-1 text-lg font-semibold tracking-tight">Log after the run</h2>
        </div>
        <Activity class="h-6 w-6 text-primary opacity-80" />
      </div>
      <p class="mb-4 text-sm leading-relaxed text-muted-foreground">Run slow enough to speak short sentences. Start slower than you think. Your goal is control, not ego pace.</p>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <label class="flex flex-col gap-1.5"><span class="text-xs font-medium text-muted-foreground">Distance km</span>
          <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" type="number" step="0.1" bind:value={runDistance}>
        </label>
        <label class="flex flex-col gap-1.5"><span class="text-xs font-medium text-muted-foreground">Time minutes</span>
          <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" type="number" step="1" bind:value={runMinutes}>
        </label>
        <label class="flex flex-col gap-1.5"><span class="text-xs font-medium text-muted-foreground">Breathing</span>
          <select class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={breathing}>
            <option>good</option><option>okay</option><option>bad</option>
          </select>
        </label>
        <label class="flex flex-col gap-1.5"><span class="text-xs font-medium text-muted-foreground">Walk breaks</span>
          <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" type="number" bind:value={walkBreaks}>
        </label>
      </div>
      
      <label class="flex flex-col gap-1.5 mb-4"><span class="text-xs font-medium text-muted-foreground">Effort {effort}/10</span>
        <input class="w-full accent-primary" type="range" min="1" max="10" bind:value={effort}>
      </label>
      
      <label class="flex flex-col gap-1.5 mb-6"><span class="text-xs font-medium text-muted-foreground">Notes</span>
        <textarea class="input-glass flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={notes} rows="3" placeholder="Example: breathing settled after 2km"></textarea>
      </label>
      
      <button class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary h-14 text-lg font-semibold text-primary-foreground glow-primary transition-all active:scale-[0.98]" on:click={saveRun}>
        <CheckCircle2 class="h-5 w-5" /> Save run
      </button>
    </div>

  {:else if $todaySession.type === 'rest'}
    <div class="glass-card rounded-2xl p-8 text-center animate-fade-in-up" style="animation-delay: 100ms;">
      <Heart class="mx-auto mb-4 h-12 w-12 text-destructive opacity-80" />
      <h2 class="mb-2 text-2xl font-bold tracking-tight">Rest day</h2>
      <p class="mb-6 text-sm leading-relaxed text-muted-foreground">Do not do hard HIIT. Walk, stretch, hydrate, and arrive fresher tomorrow.</p>
      <button class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary h-14 text-lg font-semibold text-primary-foreground glow-primary transition-all active:scale-[0.98]" on:click={saveSession}>
        <CheckCircle2 class="h-5 w-5" /> Mark rest complete
      </button>
    </div>

  {:else}
    <!-- Pre-workout Warmup Checklist -->
    {#if !running && !finished}
      <div class="glass-card rounded-2xl p-5 animate-fade-in-up" style="animation-delay: 100ms;">
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Before timer</div>
            <h2 class="mt-1 text-lg font-semibold tracking-tight">Warm-up checklist</h2>
          </div>
          <Timer class="h-6 w-6 text-primary opacity-80" />
        </div>
        <p class="text-sm text-muted-foreground mb-4">Complete each exercise to proceed</p>
        
        <div class="space-y-3 mb-6">
          {#each warmupItems as item, index}
            <button 
              class="w-full flex items-center gap-3 p-4 rounded-xl transition-all border text-left {completedWarmups.has(index) ? 'bg-accent/10 border-accent/20' : 'bg-muted/30 border-transparent'}"
              on:click={() => toggleWarmup(index)}
            >
              {#if completedWarmups.has(index)}
                <CheckCircle2 class="w-5 h-5 text-accent flex-shrink-0" />
              {:else}
                <div class="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0"></div>
              {/if}
              
              <span class="text-sm font-medium flex-1 {completedWarmups.has(index) ? 'text-accent line-through' : 'text-foreground'}">
                {itemName(item)}
              </span>
              
              <span class="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                {item.durationSeconds ? (item.durationSeconds >= 60 ? `${Math.floor(item.durationSeconds/60)}m` : `${item.durationSeconds}s`) : 'controlled'}
              </span>
              
              {#if hasTutorial(item)}
                <div class="ml-1" on:click|stopPropagation={() => selectedGuide = guideFor(item)}>
                  <Info class="w-4 h-4 text-primary" />
                </div>
              {/if}
            </button>
          {/each}
        </div>
        
        <button 
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary h-14 text-lg font-semibold text-primary-foreground transition-all active:scale-[0.98] {allWarmupsDone ? 'glow-primary opacity-100' : 'opacity-50 grayscale'}" 
          on:click={startWorkout}
          disabled={!allWarmupsDone}
        >
          {#if allWarmupsDone}
            Start Main Circuit 🔥
          {:else}
            {completedWarmups.size}/{warmupItems.length} completed
          {/if}
        </button>
      </div>
    {/if}

    <!-- Active Timer -->
    {#if running}
      <div class="glass-card rounded-2xl p-8 flex flex-col items-center animate-fade-in-up">
        
        <!-- Timer SVG -->
        <div class="relative w-64 h-64 flex items-center justify-center mb-6">
          <svg class="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="110" fill="none" stroke="hsl(var(--muted))" stroke-width="6" />
            <circle 
              class="timer-circle" 
              cx="120" cy="120" r="110" fill="none" 
              stroke={isWork ? "hsl(var(--primary))" : "hsl(var(--accent))"} 
              stroke-width="6" stroke-linecap="round" 
              stroke-dasharray={2 * Math.PI * 110} 
              stroke-dashoffset={dashoffset} 
            />
          </svg>
          
          <div class="text-center z-10">
            <div class="text-xs font-bold uppercase tracking-widest mb-2 {isWork ? 'text-primary' : 'text-accent'}">
              {isWork ? 'Work' : 'Rest'}
            </div>
            <p class="text-6xl font-bold font-mono text-foreground tracking-tighter">
              {Math.floor(remaining / 60) > 0 ? `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}` : remaining}
            </p>
          </div>
        </div>

        <div class="w-full mb-6 text-center">
          <div class="text-xl font-bold tracking-tight text-foreground mb-1">{currentName}</div>
          <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span class="bg-secondary/50 px-2 py-0.5 rounded">{phase}</span>
            <span>Next: {nextName}</span>
          </div>
        </div>
        
        {#if !isWork && nextExercise?.tutorial?.image}
          <div class="w-full max-w-xs mx-auto mb-6 bg-secondary/20 rounded-xl border border-border/50 p-4 flex flex-col items-center animate-fade-in-up">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Form preview</p>
            <img src={nextExercise.tutorial.image} alt={nextExercise.name} class="w-full h-24 object-contain rounded-lg mb-2 drop-shadow-lg" />
            {#if nextExercise.coachingCues.length}
              <p class="text-xs text-center text-primary font-medium">{nextExercise.coachingCues[0]}</p>
            {/if}
          </div>
        {/if}
        
        <!-- Controls -->
        <div class="flex items-center gap-4 mb-6 relative w-full justify-center">
          <!-- Voice toggle positioned to the left -->
          <button class="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors" on:click={() => voiceEnabled = !voiceEnabled}>
            {#if voiceEnabled}
              <Volume2 class="w-5 h-5 text-primary" />
            {:else}
              <VolumeX class="w-5 h-5 opacity-50" />
            {/if}
          </button>
          
          <button class="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors" on:click={() => resetTrigger = true}>
            <RotateCcw class="w-5 h-5" />
          </button>
          
          <button class="w-16 h-16 rounded-full flex items-center justify-center transition-all {isWork ? 'bg-primary text-primary-foreground glow-primary' : 'bg-accent text-accent-foreground glow-accent'}" on:click={togglePause}>
            {#if isPaused}
              <Play class="w-6 h-6 fill-current ml-1" />
            {:else}
              <Square class="w-5 h-5 fill-current" />
            {/if}
          </button>
          
          <button class="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors" on:click={() => skipTrigger = true}>
            <FastForward class="w-5 h-5" />
          </button>
        </div>

        <div class="flex w-full gap-3">
          {#if currentExercise?.tutorial?.image || currentExercise?.tutorial?.video}
            <button class="flex-1 items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/50 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary flex" on:click={() => selectedGuide = currentExercise}>
              <Info class="h-4 w-4" /> Form Guide
            </button>
          {/if}
          <button class="flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive py-3 text-sm font-medium shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground flex" on:click={stop}>
            <Square class="h-4 w-4" /> End Workout
          </button>
        </div>
      </div>
    {/if}

    <!-- Finished Screen -->
    {#if finished}
      <div class="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Finished</div>
            <h2 class="mt-1 text-2xl font-bold tracking-tight">Save session</h2>
          </div>
          <span class="inline-flex items-center rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground">
            {formatDuration(total)}
          </span>
        </div>
        
        <label class="flex flex-col gap-1.5 mb-4"><span class="text-xs font-medium text-muted-foreground">Effort {effort}/10</span>
          <input class="w-full accent-primary" type="range" min="1" max="10" bind:value={effort}>
        </label>
        
        <label class="flex flex-col gap-1.5 mb-4"><span class="text-xs font-medium text-muted-foreground">Energy after</span>
          <select class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={energyAfter}>
            <option>low</option><option>normal</option><option>good</option>
          </select>
        </label>
        
        <label class="mb-6 flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" bind:checked={pain} class="h-4 w-4 rounded border-border bg-background text-primary focus:ring-1 focus:ring-primary">
          Any pain?
        </label>
        
        <label class="flex flex-col gap-1.5 mb-6"><span class="text-xs font-medium text-muted-foreground">Notes</span>
          <textarea class="input-glass flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" bind:value={notes} rows="3" placeholder="Example: controlled breathing, no knee pain"></textarea>
        </label>

        {#if trackableItems().length}
          <div class="mb-5 mt-8 border-t border-border/50 pt-6">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Exercise progress</div>
            <h2 class="mt-1 text-lg font-semibold tracking-tight">Log only what matters</h2>
          </div>
          <div class="space-y-4 mb-6">
            {#each trackableItems() as item}
              {@const exercise = exerciseMap[item.exerciseId]}
              {@const input = ensureInput(item.exerciseId)}
              {@const target = exercise ? targetFor(exercise, $appData.profile.targetLevel) : null}
              <div class="rounded-xl border border-border/50 bg-secondary/20 p-4">
                <div class="mb-3 flex flex-col gap-1">
                  <strong class="text-sm font-semibold">{itemName(item)}</strong>
                  {#if target}<small class="text-xs font-medium text-primary">Target: {target.targetText}</small>{/if}
                </div>
                <div class="grid grid-cols-3 gap-3">
                  {#if exercise?.tracking.weight}
                    <label class="flex flex-col gap-1.5"><span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">kg used</span>
                      <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm" type="number" step="0.5" bind:value={input.weightKg}>
                    </label>
                  {/if}
                  {#if exercise?.tracking.reps}
                    <label class="flex flex-col gap-1.5"><span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">best reps</span>
                      <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm" type="number" bind:value={input.reps}>
                    </label>
                  {/if}
                  {#if exercise?.tracking.duration}
                    <label class="flex flex-col gap-1.5"><span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">seconds</span>
                      <input class="input-glass flex h-10 w-full rounded-md border px-3 py-2 text-sm" type="number" bind:value={input.durationSeconds}>
                    </label>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <button class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary h-14 text-lg font-semibold text-primary-foreground glow-primary transition-all active:scale-[0.98]" on:click={saveSession}>
          <CheckCircle2 class="h-5 w-5" /> Save session
        </button>
      </div>
    {/if}
  {/if}
</div>

<ExerciseGuide exercise={selectedGuide} close={() => selectedGuide = null} />
