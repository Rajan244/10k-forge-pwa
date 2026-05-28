<script lang="ts">
  import { appData, todayPlan, todaySession, dashboardStats } from '../stores/appStore';
  import { daysUntil } from '../../application/appService';
  import { CalendarDays, Play, Clock, CheckCircle2, ChevronRight, Activity, Heart, Zap, Footprints } from 'lucide-svelte';

  export let onStart: () => void;

  $: raceDays = daysUntil($appData.profile.raceDate);
  $: raceDateObj = new Date($appData.profile.raceDate);
  $: raceDateFormatted = raceDateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  $: currentDayIndex = $appData.plan.days.findIndex(d => d.date === $todayPlan.date);
  $: weekDays = $appData.plan.days.slice(Math.max(0, currentDayIndex - new Date($todayPlan.date).getDay()), currentDayIndex - new Date($todayPlan.date).getDay() + 7);
  $: doneThisWeek = weekDays.filter(d => $appData.sessionLogs[d.sessionId]).length;

  $: tomorrowPlan = $appData.plan.days[currentDayIndex + 1];
  $: tomorrowSession = tomorrowPlan ? $appData.sessions.find(s => s.id === tomorrowPlan.sessionId) || $todaySession : null;

  function getIcon(type: string) {
    if (type === 'run') return Footprints;
    if (type === 'rest') return Heart;
    if (type.includes('hiit') || type.includes('mobility')) return Zap;
    return Activity;
  }
</script>

<div class="py-6 space-y-4">
  <div class="mb-2 animate-fade-in-up">
    <h1 class="text-2xl font-bold"><span class="text-primary">10K</span> Forge</h1>
    <p class="text-sm text-muted-foreground mt-0.5">Your daily training coach</p>
  </div>

  <!-- Race Day Countdown -->
  <div class="glass-card rounded-2xl p-5 relative overflow-hidden animate-fade-in-up" style="animation-delay: 50ms;">
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
    <div class="flex items-center gap-3 mb-3">
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <CalendarDays class="w-5 h-5 text-primary" />
      </div>
      <div>
        <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">10K Race Day</p>
        <p class="text-sm text-foreground/70">{raceDateFormatted}</p>
      </div>
    </div>
    <div class="flex items-baseline gap-2">
      <span class="text-5xl font-bold font-mono text-primary">{raceDays}</span>
      <span class="text-lg text-muted-foreground font-medium">days to go</span>
    </div>
  </div>

  <!-- Today's Workout -->
  <div class="glass-card rounded-2xl p-5 relative overflow-hidden animate-fade-in-up" style="animation-delay: 100ms;">
    <div class="absolute bottom-0 right-0 w-40 h-40 bg-accent/5 rounded-full translate-y-16 translate-x-16"></div>
    <div class="flex items-center gap-3 mb-4">
      <div class="flex-1">
        <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Today's Workout</p>
        <h2 class="text-xl font-bold text-foreground">{$todaySession.name}</h2>
      </div>
    </div>

    {#if $todaySession.type !== 'rest'}
      <div class="flex items-center gap-4 mb-5">
        <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock class="w-4 h-4" />
          <span>{$todaySession.targetDurationMinutes} min</span>
        </div>
        {#if $todaySession.blocks.length > 0}
          <div class="text-sm text-muted-foreground">
            {$todaySession.blocks.reduce((acc, b) => acc + b.items.length, 0)} exercises
          </div>
        {/if}
      </div>

      <button 
        class="flex items-center justify-center w-full h-14 text-lg font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all active:scale-[0.98]"
        on:click={onStart}
      >
        {#if $appData.sessionLogs[$todaySession.id]}
          <CheckCircle2 class="w-5 h-5 mr-2" /> Review Session
        {:else}
          <Play class="w-5 h-5 mr-2 fill-current" /> Start Session
        {/if}
      </button>

      {#if $todaySession.blocks.length > 0}
        <div class="mt-4 space-y-1.5">
          {#each $todaySession.blocks.flatMap(b => b.items).slice(0, 3) as item}
            {@const ex = $appData.exercises.find(e => e.id === item.exerciseId)}
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 class="w-3.5 h-3.5 text-primary/60" />
              <span>{ex?.name || item.exerciseId}</span>
              {#if item.equipment && item.equipment !== 'Bodyweight'}
                <span class="text-[10px] bg-secondary/50 rounded-md px-1.5 py-0.5 border border-border/50">{item.equipment}</span>
              {/if}
            </div>
          {/each}
          {#if $todaySession.blocks.flatMap(b => b.items).length > 3}
            <p class="text-xs text-muted-foreground pl-5">
              + {$todaySession.blocks.flatMap(b => b.items).length - 3} more
            </p>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="bg-muted/50 rounded-xl p-4 text-center border border-border/50">
        <p class="text-muted-foreground text-sm">Rest day. Your body rebuilds stronger during recovery.</p>
      </div>
      <button 
        class="mt-4 flex items-center justify-center w-full h-14 text-lg font-semibold rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-[0.98]"
        on:click={onStart}
      >
        Review
      </button>
    {/if}
  </div>

  <!-- This Week Tracker -->
  {#if weekDays.length > 0}
    <div class="glass-card rounded-2xl p-5 animate-fade-in-up" style="animation-delay: 150ms;">
      <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">This Week</p>
      <div class="flex items-center justify-between gap-1">
        {#each weekDays as day}
          {@const isDone = !!$appData.sessionLogs[day.sessionId]}
          {@const isToday = day.date === $todayPlan.date}
          <div class="flex flex-col items-center gap-1.5">
            <span class="text-[10px] text-muted-foreground font-medium">{day.dayName.slice(0, 2)}</span>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all {isDone ? 'bg-accent/20 text-accent' : isToday ? 'bg-primary/20 text-primary ring-1 ring-primary/40' : 'bg-muted/50 text-muted-foreground border border-border/50'}">
              {#if isDone}
                <CheckCircle2 class="w-4 h-4" />
              {:else}
                <div class="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      <div class="mt-4 flex items-center justify-between text-sm">
        <span class="text-muted-foreground">{doneThisWeek} of {weekDays.length} sessions</span>
        <div class="h-1.5 flex-1 mx-3 bg-muted rounded-full overflow-hidden">
          <div class="h-full bg-accent rounded-full transition-all duration-500" style="width: {(doneThisWeek / Math.max(1, weekDays.length)) * 100}%"></div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Tomorrow -->
  {#if tomorrowSession}
    <div class="glass-card rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up" style="animation-delay: 200ms;">
      <div class="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-foreground">
        <svelte:component this={getIcon(tomorrowSession.type)} class="w-5 h-5 opacity-80" />
      </div>
      <div class="flex-1">
        <p class="text-xs text-muted-foreground font-medium">Tomorrow</p>
        <p class="text-sm font-semibold text-foreground">{tomorrowSession.name}</p>
      </div>
      <ChevronRight class="w-4 h-4 text-muted-foreground" />
    </div>
  {/if}
</div>
