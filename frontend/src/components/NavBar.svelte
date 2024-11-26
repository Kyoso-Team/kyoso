<script lang="ts">
  const dropdowns: {
    label: string;
    links: {
      label: string;
      href: string;
      status?: 'Planned' | 'WIP' | 'Beta'
    }[]
  }[] = [{
    label: 'Product',
    links: [{
      label: 'Overview',
      href: '/overview'
    }, {
      label: 'Administration',
      href: '/administration',
      status: 'WIP'
    }]
  }, {
    label: 'Developers',
    links: [{
      label: 'Github',
      href: 'https://github.com/Kyoso-Team'
    }, {
      label: 'API Documentation',
      href: '/docs/api'
    }, {
      label: 'SDKs',
      href: '/docs/sdks'
    }]
  }];
  const links: {
    label: string;
    href: string;
  }[] = [{
    label: 'Community',
    href: '/community'
  }, {
    label: 'Blog',
    href: '/blog'
  }];
</script>

<div class="fixed top-0 left-0 w-screen bg-surface-token-800-200 backdrop-blur-sm transition-opacity z-50 p-content py-4 items-center border-b border-surface-700-300 flex gap-16">
  <div class="h-6 w-32">logo placeholder</div>
  <nav class="flex items-center w-full">
    <ul class="flex gap-2 font-medium">
      {#each links as link}
        <li>
          <a class="duration-150 hover:text-primary-500 p-2 tracking-wide text-sm" href={link.href}>{link.label}</a>
        </li>
      {/each}
    </ul>
    <div class="flex justify-end w-full">
      <div class="flex">
        <button class="btn-primary">Log in</button>
      </div>
    </div>
  </nav>
</div>