<script lang="ts">
  import Modal from '$components/Modal.svelte';
  import type { ModalProps } from '$lib/types';

  const { onOkay, unmount }: ModalProps = $props();
</script>

<Modal title="Sample Modal" {unmount} onBtnClick={onOkay}>
  <p>This is a sample modal</p>
  <p>Lorem ipsum</p>
</Modal>
