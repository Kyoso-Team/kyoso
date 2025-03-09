<script lang="ts">
  import { fadeUi } from '$lib/fade-ui.svelte';
  import { fade } from 'svelte/transition';
</script>

{#if fadeUi.faded}
  <div
    class="bg-surface-token-900-100/50 fixed inset-0 z-[75] w-screen h-screen"
    transition:fade={{ duration: 150 }}
  ></div>
  <div id="faded-bg-content" class="fixed inset-0 z-[76] flex min-h-screen w-screen items-center justify-center overflow-y-auto p-8"></div>
{/if}
