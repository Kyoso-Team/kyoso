<script lang="ts">
  import { fadeUi } from '$lib/fade-ui.svelte';
    import { fade } from 'svelte/transition';
</script>

{#if fadeUi.faded}
  <div
    id="faded-bg"
    class="bg-surface-token-900-100/50 fixed inset-0 z-[75] flex min-h-screen w-screen items-center justify-center overflow-y-auto p-8"
    transition:fade={{ duration: 150 }}
  ></div>
{/if}
