<script lang="ts">
  import type { FormHandler } from '$lib/state/form.svelte';
  import type { Snippet } from 'svelte';

  const {
    form,
    children,
    class: classes = '',
    fieldsClass = ''
  }: {
    form: FormHandler<any>;
    children: Snippet;
    class?: string;
    fieldsClass?: string;
  } = $props();
</script>

<form role="presentation" onsubmit={(e) => form.submit(e)} class={`card w-full ${classes}`}>
  <div class="card-body">
    <h3 class="card-title">{form.title}</h3>
    <div class={`mt-3 card-form ${fieldsClass}`}>
      {@render children()}
    </div>
  </div>
  <div class="card-footer">
    <div class="card-btns">
      <button type="button" class="btn-md-surface-soft" onclick={() => form.reset()}>Reset</button>
      <button type="submit" class="btn-md-contrast">Submit</button>
    </div>
  </div>
</form>