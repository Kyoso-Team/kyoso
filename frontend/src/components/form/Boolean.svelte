<script lang="ts">
  import Render from '../Render.svelte';
  import Check from 'lucide-svelte/icons/check';
  import { fade, slide } from 'svelte/transition';
  import type { BooleanField } from '$lib/state/form.svelte';

  const { field }: { field: BooleanField } = $props();
  let value: boolean | null | undefined = $state(false);

  $effect(() => {
    field.set(value);
  });

  function onBlur() {
    field.displayError();
  }

  function toggle() {
    value = !value;
  }
</script>

<label class="label grid grid-cols-[auto_1fr] gap-2">
  <div>
    <button
      role="checkbox"
      aria-checked={value}
      class="input-checkbox{field.canDiplayError && field.error ? ' input-error' : ''}"
      onclick={toggle}
      disabled={field.isDisabled}
    >
      {#if value}
        <div transition:fade={{ duration: 75 }}>
          <Check size={16} strokeWidth={3} />
        </div>
      {/if}
    </button>
    <input
      type="checkbox"
      class="hidden"
      disabled={field.isDisabled}
      onblur={onBlur}
      hidden
      bind:checked={value}
    />
  </div>
  <div class="label">
    {#if field.description}
      <p class="description">
        <Render el={field.description} />
      </p>
    {/if}

    <legend>
      {field.legend}<span>{field.isOptional ? '' : '*'}</span>
    </legend>
    {#if field.preview}
      <span
        class="input-preview{field.canDiplayError && field.error ? ' input-preview-error' : ''}"
      >
        <Render el={field.preview} />
      </span>
    {/if}
    {#if field.canDiplayError && field.error}
      <span class="error" transition:slide={{ duration: 150 }}>{field.error}.</span>
    {/if}
  </div>
</label>
