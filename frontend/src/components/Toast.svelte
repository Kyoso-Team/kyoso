<script lang="ts">
  import { toast } from '$lib/toast.svelte';
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import type { ToastItem } from '$lib/types';

  function onItemMouseEnter(itemId: string) {
    toast.pause(itemId);
  }

  const colors: Record<ToastItem['type'], string> = {
    success: 'bg-green-500/10 border-green-500',
    error: 'bg-red-500/10 border-red-500',
    warning: 'bg-yellow-500/10 border-yellow-500',
    generic: 'bg-primary-500/10 border-primary-500'
  };
</script>

<div class="fixed bottom-4 left-4 z-[101] flex flex-col gap-2">
  {#each toast.showingItems as item (item.id)}
    <div
      role="presentation"
      class="bg-surface-900 w-96 overflow-hidden rounded-md text-white transition-transform duration-150 hover:scale-105"
      in:fly={{ duration: 150, x: -50 }}
      out:fly={{ duration: 150, x: -50, y: 0 }}
      animate:flip={{ duration: 150 }}
      on:mouseenter={() => onItemMouseEnter(item.id)}
      on:mouseleave={toast.resume.bind(toast)}
    >
      {#snippet toastItem()}
        <div class={`${colors[item.type]} h-full w-full border-l-4 p-3`}>
          {item.message}
        </div>
      {/snippet}
      {#if item.link}
        <a href={item.link} target="_blank">
          {@render toastItem()}
        </a>
      {:else}
        {@render toastItem()}
      {/if}
    </div>
  {/each}
</div>
