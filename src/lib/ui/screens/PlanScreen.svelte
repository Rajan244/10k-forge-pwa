<script lang="ts">
  import { appData } from '../stores/appStore';
  import { getSession, isCompleted, daysUntil } from '../../application/appService';
  import { CheckCircle2, Footprints, Heart, Zap, CalendarDays, Clock } from 'lucide-svelte';
  import type { SessionType } from '../../domain/types';

  $: raceDays = daysUntil($appData.profile.raceDate);
  $: weeksRemaining = Math.ceil(raceDays / 7);
  
  $: currentPhase = raceDays <= 7 ? "Taper Week — Reduce intensity, stay fresh" :
                    raceDays <= 14 ? "Peak Week — Final hard sessions" :
                    raceDays <= 21 ? "Build Phase — Push distance & intensity" :
                    "Base Phase — Build consistency";

  function RowIcon({ done, type }: { done: boolean, type: SessionType }) {
    if (done) return CheckCircle2;
    if (type === 'run') return Footprints;
    if (type === 'rest') return Heart;
    return Zap;
  }
</script>

<div class="py-6 space-y-6">
  <!-- Header -->
  <div class="animate-fade-in-up">
    <h1 class="text-2xl font-bold">Training Plan</h1>
    <p class="text-sm text-muted-foreground mt-0.5">{weeksRemaining} weeks until race day</p>
  </div>

  <!-- Current Phase -->
  <div class="glass-card rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up" style="animation-delay: 50ms;">
    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <CalendarDays class="w-5 h-5 text-primary" />
    </div>
    <div>
      <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Phase</p>
      <p class="text-sm font-semibold text-foreground">{currentPhase}</p>
    </div>
  </div>

  <!-- Schedule List -->
  <div class="space-y-3">
    {#each $appData.plan.days as day, i}
      {@const session = getSession($appData, day.sessionId)}
      {@const done = isCompleted($appData, day)}
      {@const isToday = new Date().toISOString().split('T')[0] === day.date}
      {@const isPast = new Date(day.date) < new Date(new Date().toISOString().split('T')[0])}
      
      <div 
        class="glass-card rounded-xl p-4 flex items-center gap-4 transition-all animate-fade-in-up {isToday ? 'ring-1 ring-primary/40 bg-primary/5' : isPast && !done ? 'opacity-50' : done ? 'opacity-60 bg-muted/20' : ''}"
        style="animation-delay: {100 + Math.min(i * 30, 800)}ms;"
      >
        <div class="w-10 h-10 shrink-0 flex items-center justify-center text-xl">
          {#if done}
            <CheckCircle2 class="w-6 h-6 text-accent" />
          {:else if session.type === 'run'}
            <Footprints class="w-6 h-6 text-primary" />
          {:else if session.type === 'rest'}
            <Heart class="w-6 h-6 text-destructive" />
          {:else}
            <Zap class="w-6 h-6 text-yellow-500" />
          {/if}
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-bold text-foreground">{day.dayName}</p>
            {#if isToday}
              <span class="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">Today</span>
            {/if}
          </div>
          <p class="text-sm text-muted-foreground truncate">{session.name}</p>
          <p class="text-[10px] text-muted-foreground/70 mt-0.5">{day.date} · {session.intensity}</p>
        </div>
        
        {#if session.targetDurationMinutes > 0}
          <div class="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Clock class="w-3.5 h-3.5" />
            <span>{session.targetDurationMinutes}m</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Training Philosophy -->
  <div class="glass-card rounded-2xl p-5 space-y-4 animate-fade-in-up" style="animation-delay: 400ms;">
    <div>
      <h3 class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Training Philosophy</h3>
      <h2 class="mt-1 text-lg font-semibold tracking-tight">How this works</h2>
    </div>
    
    <ul class="space-y-3 text-sm text-foreground/80">
      <li class="flex items-start gap-3">
        <span class="text-primary mt-0.5">▶</span>
        <span>Increase long run distance gradually to 6-8 km</span>
      </li>
      <li class="flex items-start gap-3">
        <span class="text-primary mt-0.5">▶</span>
        <span>HIIT builds strength and endurance for the run</span>
      </li>
      <li class="flex items-start gap-3">
        <span class="text-primary mt-0.5">▶</span>
        <span>Taper last week — reduce volume, maintain intensity</span>
      </li>
      <li class="flex items-start gap-3">
        <span class="text-primary mt-0.5">▶</span>
        <span>Arrive at race day fresh, not exhausted</span>
      </li>
    </ul>
  </div>
</div>
