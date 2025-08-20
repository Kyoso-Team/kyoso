<script lang="ts">
  import { fadeUi } from '$lib/fade-ui.svelte';
  import { onMount } from 'svelte';
  import { portal } from 'svelte-portal';
  import { fade } from 'svelte/transition';
  import type { Snippet } from 'svelte';
  import type { MaybePromise } from '$lib/types';

  const {
    title,
    children,
    yesBtnLabel,
    onYesBtnClick,
    noBtnLabel,
    onNoBtnClick,
    unmount
  }: {
    title: string;
    children: Snippet;
    unmount: () => MaybePromise<void>;
    yesBtnLabel: string;
    onYesBtnClick: () => MaybePromise<void>;
    noBtnLabel: string;
    onNoBtnClick?: () => MaybePromise<void>;
  } = $props();

  onMount(() => {
    fadeUi.set(true);
  });

  async function yes() {
    await onYesBtnClick();
    await unmount();
    fadeUi.set(false);
  }

  async function no() {
    await onNoBtnClick?.();
    await unmount();
    fadeUi.set(false);
  }
</script>

<div
  class="bg-surface-token-800-200 border-surface-token-700-300 m-auto flex h-max w-[32rem] flex-col rounded-md border p-8"
  use:portal={'#faded-bg-content'}
  transition:fade={{ duration: 75 }}
>
  <h2>{title}</h2>
  <div class="my-8">
    {@render children()}
  </div>
  <div class="flex w-full justify-end">
    <div class="flex gap-2">
      <button class="btn-md-surface-soft" onclick={no}>{noBtnLabel}</button>
      <button class="btn-md-contrast" onclick={yes}>{yesBtnLabel}</button>
    </div>
  </div>
</div>
