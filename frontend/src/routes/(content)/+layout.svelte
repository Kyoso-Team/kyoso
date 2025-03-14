<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../../app.css';
  import NavBar from './NavBar.svelte';
  import FadedBg from '$components/FadedBg.svelte';
  import Toast from '$components/Toast.svelte';
  import { c } from '$lib/common.svelte';
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
<Toast />
<FadedBg />
<NavBar />
{@render children()}
