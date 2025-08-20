<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../../app.css';
  import NavBar from './NavBar.svelte';
  import FadedBg from '$components/FadedBg.svelte';
  import Toast from '$components/Toast.svelte';
  import { c } from '$lib/state/common.svelte';
  import { toggleTheme } from '$lib/theme';
  import type { LayoutServerData } from './$types';

  const { children, data }: {
    children: Snippet;
    data: LayoutServerData;
  } = $props();

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
<div class="content-wrapper">
  <!-- 59px is the height of the nav bar -->
  <div class="content mt-[calc(59px+40px)] mb-10">
    {@render children()}
  </div>
</div>
