<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../../app.css';
  import NavBar from '$components/NavBar.svelte';
  import { toggleTheme } from '$lib/theme';
  import { fadeUi } from '$lib/fade-ui.svelte';
  import { fade } from 'svelte/transition';

  const { children } = $props() as {
    children: Snippet;
  };
</script>

<svelte:head>
  {@html `<\u{73}cript>(${toggleTheme.toString()})();</script>`}
</svelte:head>
{#if fadeUi.faded}
  <div id="faded-bg" class="fixed inset-0 w-screen min-h-screen p-8 bg-surface-token-900-100/50 z-[75] flex items-center justify-center overflow-y-auto" transition:fade={{ duration: 150 }}></div>
{/if}
<NavBar />
{@render children()}
