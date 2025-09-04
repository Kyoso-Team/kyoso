<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../../app.css';
  import NavBar from './NavBar.svelte';
  import FadedBg from '$components/FadedBg.svelte';
  import Toast from '$components/Toast.svelte';
  import { c } from '$lib/state/common.svelte';
  import { toggleTheme } from '$lib/theme';
  import { page } from '$app/state';
  import type { LayoutServerData } from './$types';

  const { children, data }: {
    children: Snippet;
    data: LayoutServerData;
  } = $props();
  let h1 = $state('');

  $effect(() => {
    c.setSession(data.session);
  });

  $effect(() => {
    if (page.url.pathname.includes('/dev')) {
      h1 = 'Test Page';
    }
  });
</script>

<svelte:head>
  {@html `<\u{73}cript>(${toggleTheme.toString()})();</script>`}
</svelte:head>
<Toast />
<FadedBg />
<NavBar />
<div class="content-wrapper flex-col">
  <!-- 59px is the height of the nav bar -->
  <div class="content mt-[calc(59px+32px)]">
    <h1>{h1}</h1>
  </div>
  <div class="line my-8"></div>
  <div class="content">
    {@render children()}
  </div>
</div>
