<script lang="ts">
  import Render from '../Render.svelte';
  import { slide } from 'svelte/transition';
  import type { TextField } from '$lib/state/form.svelte';

  const { field }: { field: TextField<any> } = $props();
  let value: string | null | undefined = $state();

  $effect(() => {
    field.set(value);
  });

  function onBlur() {
    field.displayError();
  }
</script>

<label class="label">
  <legend>
    {field.legend}<span>{field.isOptional ? '' : '*'}</span>
  </legend>
  {#if field.description}
    <p class="description">
      <Render el={field.description} />
    </p>
  {/if}
  <input
    type="text"
    name={field.key}
    class="input{field.canDiplayError && field.error ? ' input-error' : ''}"
    disabled={field.isDisabled}
    onblur={onBlur}
    bind:value
  />
  {#if field.preview}
    <span class="input-preview{field.canDiplayError && field.error ? ' input-preview-error' : ''}">
      <Render el={field.preview} />
    </span>
  {/if}
  {#if field.canDiplayError && field.error}
    <span class="error" transition:slide={{ duration: 150 }}>{field.error}.</span>
  {/if}
</label>
