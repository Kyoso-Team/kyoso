<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../../app.css';
  import FadedBg from '$components/FadedBg.svelte';
  import { c } from '$lib/state/common.svelte';
  import { toggleTheme } from '$lib/theme';
  import type { LayoutData } from './$types';

  const { children, data } = $props() as {
    children: Snippet;
    data: LayoutData;
  };

  $effect(() => {
    c.setSession(data.session);
  });
</script>

<svelte:head>
  {@html `<\u{73}cript>(${toggleTheme.toString()})();</script>`}
</svelte:head>
<FadedBg />
{@render children()}
