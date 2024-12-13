<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../../app.css';
  import { toggleTheme } from '$lib/theme';

  const { children } = $props() as {
    children: Snippet;
  };
</script>

<svelte:head>
  {@html `<\u{73}cript>(${toggleTheme.toString()})();</script>`}
</svelte:head>
{@render children()}
