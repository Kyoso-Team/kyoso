<script lang="ts">
  import type { Snippet } from 'svelte';

  const { el }: { el: Snippet | string } = $props();
</script>

{#if typeof el === 'string'}
  {el}
{:else}
  {@render el()}
{/if}
