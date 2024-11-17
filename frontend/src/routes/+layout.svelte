<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.css';

  const { children } = $props() as {
    children: Snippet;
  };
</script>

{@render children()}
