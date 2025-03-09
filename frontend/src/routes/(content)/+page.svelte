<script lang="ts">
  import CreateTournamentForm from '$ui/forms/CreateTournamentForm.svelte';
  import TestModal from '$ui/modals/TestModal.svelte';

  let open = $state(false);
  let open1 = $state(false);

  function close() {
    open = false;
  }

  function close1() {
    open1 = false;
  }
</script>

<button class="btn-md-contrast mt-16" onclick={() => (open = !open)}>Create tournament</button>
<button class="btn-md-contrast mt-16" onclick={() => (open1 = !open1)}>Test modal 1</button>
{#if open}
  <CreateTournamentForm onCancel={close} />
{/if}
{#if open1}
  <TestModal onOkay={close1} />
{/if}