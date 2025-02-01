<script lang="ts">
  import { c } from '$lib/common.svelte';
  import { loginUrl } from '$lib/api';

  const links: {
    label: string;
    href: string;
  }[] = [
    {
      label: 'Community',
      href: '/community'
    },
    {
      label: 'Blog',
      href: '/blog'
    }
  ];
</script>

<div
  class="bg-surface-token-800-200 p-content border-surface-token-700-300 fixed left-0 top-0 z-50 flex w-screen items-center gap-16 border-b py-3 backdrop-blur-sm transition-opacity"
>
  <div class="flex h-6 w-32 items-center text-sm">logo placeholder</div>
  <nav class="flex w-full items-center">
    <ul class="flex gap-2 font-medium">
      {#if c.session}
        <li>
          <a class="btn-md-ghost" href="/dashboard">Dashboard</a>
        </li>
      {/if}
      {#each links as link}
        <li>
          <a class="btn-md-ghost" href={link.href}>{link.label}</a>
        </li>
      {/each}
    </ul>
    <div class="flex w-full justify-end">
      <div class="flex gap-2">
        {#if c.session}
          <button class="btn-md-avatar">
            <img src={`https://a.ppy.sh/${c.session.osu.osuUserId.toString()}`} alt="" />
          </button>
        {:else}
          <a href={loginUrl} class="btn-md-contrast">Login</a>
        {/if}
      </div>
    </div>
  </nav>
</div>
