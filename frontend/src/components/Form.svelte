<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { onDestroy, onMount, type Snippet } from 'svelte';
  import { fadeUi } from '$lib/fade-ui.svelte';
  import { portal } from 'svelte-portal';
    import type { Form } from '$lib/form.svelte';
    import { focusTrap } from '$lib/focus-trap';

  const { form, header, children }: {
    form: Form<any>;
    children: Snippet;
    header?: Snippet;
  } = $props();

  onMount(() => {
    fadeUi.set(true);
  });

  onDestroy(() => {
    fadeUi.set(false);
  });

  function onKeyDown(e: KeyboardEvent) {
    return e.key !== 'Enter';
  }
</script>

<form
  class="rounded-md bg-surface-token-800-200 border border-surface-token-700-300 p-8 flex flex-col w-[32rem] h-max m-auto"
  role="presentation"
  onkeydown={onKeyDown}
  onsubmit={form.submit}
  transition:fly={{ duration: 150, y: 100 }}
  use:portal={'#faded-bg'}
  use:focusTrap={true}
>
  <h2>{form.title}</h2>
  <div class="line mt-4"></div>
  {@render header?.()}
  <div class="flex flex-col gap-4 my-4 [&>strong]:font-semibold [&>strong]:text-surface-token-100-900">
    {@render children()}
  </div>
  <div class="line my-4"></div>
  <div class="grid grid-cols-2 items-center">
    <div class="text-red-500 text-sm">
      {#if form.hasErrors && form.attemptedToSubmit}
        <span transition:fade={{ duration: 150 }}>You have errors in your form</span>
      {/if}
    </div>
    <div class="w-full flex justify-end">
      <div class="flex gap-2">
        <button type="button" class="btn-md-surface-soft" onclick={form.cancel}>Cancel</button>
        <button type="submit" class="btn-md-contrast">Submit</button>
      </div>
    </div>
  </div>
</form>