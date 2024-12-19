<script lang="ts">
  import CreateTournamentForm from '$forms/CreateTournamentForm.svelte';

  let open = $state(false);

  function close() {
    open = false;
  }
</script>

<button class="btn-md-contrast mt-16" onclick={() => (open = !open)}>Create tournament</button>
{#if open}
  <CreateTournamentForm unmount={close} />
{/if}
