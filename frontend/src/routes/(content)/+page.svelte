<script lang="ts">
  import MarkdowEditor from '$components/MarkdowEditor.svelte';
  import Tooltip from '$components/Tooltip.svelte';
  import CreateTournamentForm from '$ui/forms/CreateTournamentForm.svelte';
  import Test1Modal from '$ui/modals/Test1Modal.svelte';
  import TestModal from '$ui/modals/TestModal.svelte';

  let open = $state(false);
  let open1 = $state(false);
  let open2 = $state(false);
  let value = $state('');

  function close() {
    open = false;
  }

  function close1() {
    open1 = false;
  }

  function close2() {
    open2 = false;
  }
</script>

<button class="btn-md-contrast mt-16" onclick={() => (open = !open)}>Create tournament</button>
<button class="btn-md-contrast mt-2" onclick={() => (open1 = !open1)}>Test modal 1</button>
<button class="btn-md-contrast mt-2" onclick={() => (open2 = !open2)}>Test modal 2</button>
{#if open}
  <CreateTournamentForm unmount={close} />
{/if}
{#if open1}
  <TestModal unmount={close1} />
{/if}
{#if open2}
  <Test1Modal unmount={close2} onYes={() => console.log('yes')} onNo={() => console.log('no')} />
{/if}
<Tooltip position="top" class="mt-16">
  <div class="ml-4 h-16 w-64 bg-black text-white">Hover me</div>
  {#snippet tip()}
    Sample tooltip
  {/snippet}
</Tooltip>
<div class="my-16 ml-8 w-[32rem]">
  <MarkdowEditor bind:value />
</div>
