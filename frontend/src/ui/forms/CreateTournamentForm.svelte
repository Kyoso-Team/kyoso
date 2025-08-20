<script lang="ts">
  import FormElement from '$components/Form.svelte';
  import Boolean from '$components/form/Boolean.svelte';
  import Number from '$components/form/Number.svelte';
  import Options from '$components/form/Options.svelte';
  import Text from '$components/form/Text.svelte';
  import { F, Form } from '$lib/form.svelte';
  import { page } from '$app/state';
  import type { FormProps } from '$lib/types';

  const { unmount, onCancel }: FormProps = $props();

  const form = new Form('Create Tournament', {
    name: new F.Text('Tournament name').gte(2).lte(50),
    acronym: new F.Text('Tournament acronym').gte(2).lte(8),
    urlSlug: new F.Text('URL slug', {
      preview: urlSlugPreview
    })
      .gte(2)
      .lte(16)
      .regex(
        /^[a-z0-9-]+$/,
        'Input must only contain numbers (0-9), lowercase letters (a-z), and hyphens (-)'
      ),
    type: new F.Options('Tournament type', {
      solo: 'Solo',
      teams: 'Teams',
      draft: 'Draft'
    }),
    teamSettings: {
      minTeamSize: new F.Number('Min. team size').int().gte(1).lte(16),
      maxTeamSize: new F.Number('Max. team size').int().gte(2).lte(16)
    },
    isOpenRank: new F.Boolean('Is open rank?'),
    rankRange: {
      lower: new F.Number('Lower rank range limit').int().gte(1),
      upper: new F.Number('Upper rank range limit').optional().int().gte(1)
    }
  })
    .onSubmit(async (value) => {
      console.log(value);
    })
    .onCancel(async () => {
      await onCancel?.();
      await unmount();
    });

  $effect(() => {
    const disable = form.fields.type.raw !== 'teams';
    form.fields.teamSettings.maxTeamSize.disable(disable);
    form.fields.teamSettings.minTeamSize.disable(disable);
  });

  $effect(() => {
    const disable = form.fields.isOpenRank.raw === true;
    form.fields.rankRange.lower.disable(disable);
    form.fields.rankRange.upper.disable(disable);
  });
</script>

{#snippet urlSlugPreview()}
  <span class="font-medium">Example URL:</span>
  {page.url.origin}/t/{form.fields.urlSlug.raw ? form.fields.urlSlug.raw : '[slug]'}
{/snippet}
<FormElement {form}>
  <strong>Branding</strong>
  <Text field={form.fields.name} />
  <Text field={form.fields.acronym} />
  <Text field={form.fields.urlSlug} />
  <div class="line mt-4"></div>
  <strong>Format</strong>
  <Options field={form.fields.type} />
  <Number field={form.fields.teamSettings.minTeamSize} />
  <Number field={form.fields.teamSettings.maxTeamSize} />
  <div class="line mt-4"></div>
  <strong>Rank Range</strong>
  <Boolean field={form.fields.isOpenRank} />
  <Number field={form.fields.rankRange.lower} />
  <Number field={form.fields.rankRange.upper} />
</FormElement>
