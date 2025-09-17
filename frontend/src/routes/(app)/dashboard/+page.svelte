<script lang="ts">
  import CreateTournamentForm from '$ui/forms/CreateTournamentForm.svelte';

  const open = $state({
    createTournamentForm: false
  });
  
  function openCreateTournamentForm() {
    open.createTournamentForm = true;
  }

  function closeCreateTournamentForm() {
    open.createTournamentForm = false;
  }
</script>

{#if open.createTournamentForm}
  <CreateTournamentForm unmount={closeCreateTournamentForm} />
{/if}
<button class="btn-md-contrast" onclick={openCreateTournamentForm}>Create Tournament</button>