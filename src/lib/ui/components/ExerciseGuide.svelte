<script lang="ts">
  import type { Exercise } from '../../domain/types';
  import { X } from 'lucide-svelte';
  export let exercise: Exercise | null = null;
  export let close: () => void;
</script>

{#if exercise}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
    role="presentation"
    on:click={close}
  >
    <!-- Bottom Sheet -->
    <div
      class="w-full max-w-md overflow-y-auto rounded-t-2xl border-t bg-card pb-safe"
      style="max-height:90dvh"
      role="dialog"
      aria-modal="true"
      aria-label="{exercise.name} guide"
      tabindex="-1"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <!-- Sheet Header -->
      <div class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-card/90 px-5 py-5 backdrop-blur-md">
        <div>
          <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Exercise guide</div>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-foreground">{exercise.name}</h2>
          <p class="mt-0.5 text-xs text-muted-foreground">{exercise.category} · {exercise.equipment.join(', ')}</p>
        </div>
        <button
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close guide"
          on:click={close}
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="px-5 py-6 space-y-6">
        <!-- Media -->
        {#if exercise.tutorial?.video}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video class="w-full rounded-xl border object-cover shadow-sm" controls playsinline src={exercise.tutorial.video}></video>
        {:else if exercise.tutorial?.image}
          <img class="w-full rounded-xl border object-cover shadow-sm" src={exercise.tutorial.image} alt="{exercise.name} tutorial" />
        {/if}

        <!-- How to do it -->
        <section class="rounded-xl border bg-secondary/30 p-4 shadow-sm">
          <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">How to do it</h3>
          <ol class="space-y-2">
            {#each exercise.instructionSteps as step, i}
              <li class="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                {step}
              </li>
            {/each}
          </ol>
        </section>

        <!-- Coaching cues -->
        <section class="rounded-xl border bg-secondary/30 p-4 shadow-sm">
          <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">Coaching cues</h3>
          <ul class="space-y-1.5">
            {#each exercise.coachingCues as cue}
              <li class="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
                {cue}
              </li>
            {/each}
          </ul>
        </section>

        <!-- Common mistakes -->
        <section class="rounded-xl border bg-secondary/30 p-4 shadow-sm">
          <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">Common mistakes</h3>
          <ul class="space-y-1.5">
            {#each exercise.commonMistakes as mistake}
              <li class="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"></span>
                {mistake}
              </li>
            {/each}
          </ul>
        </section>

        <!-- Safety -->
        {#if exercise.safetyNotes.length}
          <section class="rounded-xl border border-destructive/20 bg-destructive/5 p-4 shadow-sm">
            <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-destructive">Safety</h3>
            <ul class="space-y-1.5">
              {#each exercise.safetyNotes as note}
                <li class="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"></span>
                  {note}
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      </div>
    </div>
  </div>
{/if}
