<script lang="ts">
  import { fadeUi } from '$lib/fade-ui.svelte';
  import { onMount } from 'svelte';
  import { portal } from 'svelte-portal';
  import { fade } from 'svelte/transition';
  import { focusTrap } from '$lib/focus-trap';
  import type { Snippet } from 'svelte';
  import type { Form } from '$lib/form.svelte';

  const {
    form,
    header,
    children
  }: {
    form: Form<any>;
    children: Snippet;
    header?: Snippet;
  } = $props();

  onMount(() => {
    fadeUi.set(true);
  });

  function onKeyDown(e: KeyboardEvent) {
    return e.key !== 'Enter';
  }
</script>

<form
  class="bg-surface-token-800-200 border-surface-token-700-300 m-auto flex h-max w-[32rem] flex-col rounded-md border p-8"
  role="presentation"
  onkeydown={onKeyDown}
  onsubmit={form.submit}
  use:portal={'#faded-bg-content'}
  transition:fade={{ duration: 75 }}
  use:focusTrap={true}
>
  <h2>{form.title}</h2>
  <div class="line mt-4"></div>
  {@render header?.()}
  <div
    class="[&>strong]:text-surface-token-100-900 my-4 flex flex-col gap-4 [&>strong]:font-semibold"
  >
    {@render children()}
  </div>
  <div class="line my-4"></div>
  <div class="grid grid-cols-2 items-center">
    <div class="text-sm text-red-500">
      {#if form.hasErrors && form.attemptedToSubmit}
        <span transition:fade={{ duration: 150 }}>You have errors in your form</span>
      {/if}
    </div>
    <div class="flex w-full justify-end">
      <div class="flex gap-2">
        <button type="button" class="btn-md-surface-soft" onclick={form.cancel}>Cancel</button>
        <button type="submit" class="btn-md-contrast">Submit</button>
      </div>
    </div>
  </div>
</form>
