<script lang="ts">
    import { fadeUi } from '$lib/fade-ui.svelte';
    import { focusTrap } from '$lib/focus-trap';
    import type { MaybePromise } from '$lib/types';
  import { onMount, type Snippet } from 'svelte';
    import { portal } from 'svelte-portal';
    import { fade } from 'svelte/transition';

  const { title, children, btnLabel = 'Ok', onBtnClick }: {
    title: string;
    children: Snippet;
    onBtnClick: () => MaybePromise<void>;
    btnLabel?: string;
  } = $props();

  onMount(() => {
    fadeUi.set(true);
  });

  async function click() {
    await onBtnClick();
    fadeUi.set(false);
  }
</script>

<div
  class="bg-surface-token-800-200 border-surface-token-700-300 m-auto flex h-max w-[32rem] flex-col rounded-md border p-8"
  use:portal={'#faded-bg-content'}
  transition:fade={{ duration: 75 }}
  use:focusTrap={true}
>
  <h2>{title}</h2>
  <div class="my-8">
    {@render children()}
  </div>
  <div class="flex w-full justify-end">
    <div class="flex gap-2">
      <button class="btn-md-contrast" onclick={click}>{btnLabel}</button>
    </div>
  </div>
</div>