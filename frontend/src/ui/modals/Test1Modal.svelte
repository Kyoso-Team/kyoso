<script lang="ts">
  import ConfirmationModal from '$components/ConfirmationModal.svelte';
  import type { ConfirmationModalProps } from '$lib/types';

  const { onYes, onNo, unmount }: ConfirmationModalProps = $props();
</script>

<ConfirmationModal title="Sample Modal" yesBtnLabel="Log" noBtnLabel="Cancel" unmount={unmount} onYesBtnClick={onYes} onNoBtnClick={onNo}>
  <p>This is a sample modal</p>
  <p>Lorem ipsum</p>
</ConfirmationModal>
