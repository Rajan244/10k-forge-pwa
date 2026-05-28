<script lang="ts">
  export let data: number[];
  export let labels: string[];
  export let color: string = 'hsl(var(--primary))';
  export let gradientId: string = 'chart-gradient';
  
  $: min = data.length > 0 ? Math.min(...data) * 0.9 : 0;
  $: max = data.length > 0 ? Math.max(...data) * 1.1 : 1;
  $: range = max - min || 1;
  
  $: points = data.map((val, i) => {
    const x = (i / Math.max(1, data.length - 1)) * 100;
    const y = 40 - ((val - min) / range) * 40;
    return `${x},${y}`;
  }).join(' ');
  
  $: path = data.length > 1 ? `M ${points}` : '';
  $: fillPath = data.length > 1 ? `M 0,40 L 0,${40 - ((data[0] - min) / range) * 40} L ${points} L 100,40 Z` : '';
</script>

{#if data.length > 1}
  <div class="w-full h-32 relative flex flex-col">
    <svg class="w-full flex-1 overflow-visible" viewBox="-2 -2 104 44" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color={color} stop-opacity="0.4" />
          <stop offset="100%" stop-color={color} stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      {#each data as val, i}
        {@const x = (i / (data.length - 1)) * 100}
        {@const y = 40 - ((val - min) / range) * 40}
        <circle cx={x} cy={y} r="2" fill="hsl(var(--background))" stroke={color} stroke-width="1.5" />
      {/each}
    </svg>
    <div class="flex justify-between text-[9px] font-medium text-muted-foreground mt-2 px-1 uppercase tracking-wider">
      <span>{labels[0]}</span>
      <span>{labels[labels.length - 1]}</span>
    </div>
  </div>
{:else}
  <div class="w-full h-24 flex items-center justify-center text-xs text-muted-foreground bg-secondary/20 rounded-xl border border-border/50">
    Need at least 2 logs for chart
  </div>
{/if}
