<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../../app.css';
  import NavBar from '$components/NavBar.svelte';
  import { fadeUi } from '$lib/fade-ui.svelte';
  import { fade } from 'svelte/transition';
  import { toggleTheme } from '$lib/theme';

  const { children } = $props() as {
    children: Snippet;
  };
</script>

<svelte:head>
  {@html `<\u{73}cript>(${toggleTheme.toString()})();</script>`}
</svelte:head>
{#if fadeUi.faded}
  <div
    id="faded-bg"
    class="bg-surface-token-900-100/50 fixed inset-0 z-[75] flex min-h-screen w-screen items-center justify-center overflow-y-auto p-8"
    transition:fade={{ duration: 150 }}
  ></div>
{/if}
<NavBar />
{@render children()}
