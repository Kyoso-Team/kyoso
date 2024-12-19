<script lang="ts">
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
      {#each links as link}
        <li>
          <a class="btn-md-ghost" href={link.href}>{link.label}</a>
        </li>
      {/each}
    </ul>
    <div class="flex w-full justify-end">
      <div class="flex">
        <a href="/" class="btn-md-contrast">Login</a>
      </div>
    </div>
  </nav>
</div>
