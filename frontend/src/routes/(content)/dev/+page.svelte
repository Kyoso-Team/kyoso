<script lang="ts">
  import ConfirmationModal from '$components/ConfirmationModal.svelte';
  import MarkdowEditor from '$components/MarkdowEditor.svelte';
  import Modal from '$components/Modal.svelte';
  import Tooltip from '$components/Tooltip.svelte';
  import { toast } from '$lib/state/toast.svelte';
  import { F, FormHandler } from '$lib/state/form.svelte';
  import Text from '$components/form/Text.svelte';
  import Number from '$components/form/Number.svelte';
  import Boolean from '$components/form/Boolean.svelte';
  import Options from '$components/form/Options.svelte';
  import FormCard from '$components/FormCard.svelte';
  import CreateTournamentForm from '$ui/forms/CreateTournamentForm.svelte';

  let open = $state(false);
  let openModal = $state(false);
  let openConfirmationModal = $state(false);
  let value = $state('');
  const inlineForm = new FormHandler('Sample Inline Form', {
    text: new F.Text('Text'),
    number: new F.Number('Number'),
    boolean: new F.Boolean('Boolean'),
    options: new F.Options('Options', {
      o1: '1',
      o2: '2',
      o3: '3'
    })
  })
    .setDefaultValue(() => ({
      text: 'click the circle',
      number: 727,
      boolean: true,
      options: 'o2'
    }))
    .onSubmit(async (value) => {
      console.log(value);
    });

  function closeForm() {
    open = false;
  }

  function closeModal() {
    openModal = false;
  }

  function closeConfirmationModal() {
    openConfirmationModal = false;
  }
</script>

{#if open}
  <CreateTournamentForm unmount={closeForm} />
{/if}
{#if openModal}
  <Modal title="Sample Modal" unmount={closeModal}>
    <p>This is a sample modal</p>
    <p>Lorem ipsum</p>
  </Modal>
{/if}
{#if openConfirmationModal}
  <ConfirmationModal
    title="Sample Modal"
    yesBtnLabel="Log"
    noBtnLabel="Cancel"
    unmount={closeConfirmationModal}
    onYesBtnClick={() => console.log('yes')}
    onNoBtnClick={() => console.log('no')}
  >
    <p>This is a sample modal</p>
    <p>Lorem ipsum</p>
  </ConfirmationModal>
{/if}
<div class="flex flex-col gap-8">
  <div class="w-full card">
    <div class="card-body">
      <h3 class="card-title">Forms & Modals</h3>
      <div class="flex gap-2 mt-3">
        <button class="btn-md-contrast" onclick={() => (open = !open)}>Create tournament</button>
        <button class="btn-md-contrast" onclick={() => (openModal = !openModal)}>Test modal 1</button>
        <button class="btn-md-contrast" onclick={() => (openConfirmationModal = !openConfirmationModal)}>Test modal 2</button>
      </div>
    </div>
  </div>
  <div class="w-full card">
    <div class="card-body">
      <h3 class="card-title">Sample Card</h3>
      <p class="mt-3">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nesciunt consequatur ea, pariatur officia impedit cupiditate fuga reiciendis ullam perspiciatis, commodi fugit corporis nemo libero nihil alias exercitationem labore accusantium perferendis.</p>
    </div>
    <div class="card-footer">
      <div class="card-footer-body">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit.
      </div>
      <div class="card-btns">
        <Tooltip position="top" btnClass="btn-md-contrast">
          Test
          {#snippet tip()}
            Sample tooltip
          {/snippet}
        </Tooltip>
      </div>
    </div>
  </div>
  <FormCard form={inlineForm} fieldsClass="grid-cols-3">
    <Text field={inlineForm.fields.text} />
    <Number field={inlineForm.fields.number} />
    <Options field={inlineForm.fields.options} />
    <div></div>
    <Boolean field={inlineForm.fields.boolean} />
  </FormCard>
</div>
<div class="my-16 w-[32rem]">
  <MarkdowEditor bind:value />
</div>
<h2 class="mb-4">Toast</h2>
<div class="mb-16 flex gap-2">
  <button
    class="btn-md-contrast"
    onclick={() =>
      toast.add({
        message: 'Sample messsage',
        type: 'generic'
      })}>Generic</button
  >
  <button
    class="btn-md-contrast"
    onclick={() =>
      toast.add({
        message: 'Sample messsage',
        type: 'error'
      })}>Error</button
  >
  <button
    class="btn-md-contrast"
    onclick={() =>
      toast.add({
        message:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        type: 'warning'
      })}>Important</button
  >
  <button
    class="btn-md-contrast"
    onclick={() =>
      toast.add({
        message: 'Sample messsage',
        type: 'success'
      })}>Success</button
  >
  <button
    class="btn-md-contrast"
    onclick={() =>
      toast.add({
        message: 'Sample messsage',
        type: 'generic',
        link: 'https://osu.ppy.sh'
      })}>With link</button
  >
</div>
