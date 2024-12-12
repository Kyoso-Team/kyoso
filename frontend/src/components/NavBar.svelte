<script lang="ts">
  const dropdowns: {
    label: string;
    links: {
      label: string;
      href: string;
      status?: 'Planned' | 'WIP' | 'Beta';
    }[];
  }[] = [
    {
      label: 'Product',
      links: [
        {
          label: 'Overview',
          href: '/overview'
        },
        {
          label: 'Administration',
          href: '/administration',
          status: 'WIP'
        }
      ]
    },
    {
      label: 'Developers',
      links: [
        {
          label: 'Github',
          href: 'https://github.com/Kyoso-Team'
        },
        {
          label: 'API Documentation',
          href: '/docs/api'
        },
        {
          label: 'SDKs',
          href: '/docs/sdks'
        }
      ]
    }
  ];
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
  class="bg-surface-token-800-200 p-content border-surface-700-300 fixed left-0 top-0 z-50 flex w-screen items-center gap-16 border-b py-4 backdrop-blur-sm transition-opacity"
>
  <div class="h-6 w-32">logo placeholder</div>
  <nav class="flex w-full items-center">
    <ul class="flex gap-2 font-medium">
      {#each links as link}
        <li>
          <a class="hover:text-primary-500 p-2 text-sm tracking-wide duration-150" href={link.href}
            >{link.label}</a
          >
        </li>
      {/each}
    </ul>
    <div class="flex w-full justify-end">
      <div class="flex">
        <button class="btn-primary">Log in</button>
      </div>
    </div>
  </nav>
</div>
