<script lang="ts">
  import { onMount } from 'svelte';
  import { activeTab, bootApp } from '../lib/ui/stores/appStore';
  import HomeScreen from '../lib/ui/screens/HomeScreen.svelte';
  import StartScreen from '../lib/ui/screens/StartScreen.svelte';
  import DashboardScreen from '../lib/ui/screens/DashboardScreen.svelte';
  import PlanScreen from '../lib/ui/screens/PlanScreen.svelte';
  import ProfileScreen from '../lib/ui/screens/ProfileScreen.svelte';
  import { Home, Play, BarChart2, CalendarDays, Settings } from 'lucide-svelte';
  import type { TabId } from '../lib/domain/types';

  onMount(bootApp);

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'home', label: 'Today', icon: Home },
    { id: 'start', label: 'Train', icon: Play },
    { id: 'dashboard', label: 'Progress', icon: BarChart2 },
    { id: 'plan', label: 'Plan', icon: CalendarDays },
    { id: 'profile', label: 'Settings', icon: Settings }
  ];

  function go(id: TabId) {
    activeTab.set(id);
    history.replaceState(null, '', `?tab=${id}`);
  }
</script>

<div class="min-h-screen bg-background pb-20">
  <main class="max-w-lg mx-auto px-4">
    {#if $activeTab === 'home'}<HomeScreen onStart={() => go('start')} />{/if}
    {#if $activeTab === 'start'}<StartScreen />{/if}
    {#if $activeTab === 'dashboard'}<DashboardScreen />{/if}
    {#if $activeTab === 'plan'}<PlanScreen />{/if}
    {#if $activeTab === 'profile'}<ProfileScreen />{/if}
  </main>
</div>

<nav class="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 safe-area-bottom" aria-label="Main navigation">
  <div class="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
    {#each tabs as tab}
      <button 
        class="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
        on:click={() => go(tab.id)} 
        aria-label={tab.label}
      >
        {#if $activeTab === tab.id}
          <div class="absolute inset-0 nav-active-bg rounded-xl"></div>
        {/if}
        <svelte:component this={tab.icon} class="w-5 h-5 relative z-10 transition-colors { $activeTab === tab.id ? 'text-primary' : 'text-muted-foreground' }" />
        <span class="text-[10px] font-medium relative z-10 transition-colors { $activeTab === tab.id ? 'text-primary' : 'text-muted-foreground' }">{tab.label}</span>
      </button>
    {/each}
  </div>
</nav>
