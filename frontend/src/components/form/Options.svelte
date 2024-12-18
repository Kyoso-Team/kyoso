<script lang="ts">
  import type { OptionalOptionsField, OptionsField } from '$lib/form.svelte';
  import Render from '../Render.svelte';
  import { slide } from 'svelte/transition';

  const { field }: { field: OptionsField<any> | OptionalOptionsField<any>; } = $props();
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
  <select class={`input-select${field.canDiplayError && field.error ? ' input-error' : ''}`} disabled={field.isDisabled} onblur={onBlur} bind:value={value}>
    <option value="">---</option>
    {#each Object.entries(field.options) as [option, label]}
      <option value={option}>{label}</option>
    {/each}
  </select>
  {#if field.preview}
    <span class={`input-preview${field.canDiplayError && field.error ? ' input-preview-error' : ''}`}>
      <Render el={field.preview} />
    </span>
  {/if}
  {#if field.canDiplayError && field.error}
    <span class="error" transition:slide={{ duration: 150 }}>{field.error}.</span>
  {/if}
</label>