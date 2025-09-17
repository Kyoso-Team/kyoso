<script lang="ts">
  import Form from '$components/Form.svelte';
  import Boolean from '$components/form/Boolean.svelte';
  import Number from '$components/form/Number.svelte';
  import Options from '$components/form/Options.svelte';
  import Text from '$components/form/Text.svelte';
  import { F, FormHandler } from '$lib/state/form.svelte';
  import { page } from '$app/state';
  import * as api from '$lib/api.requests';
  import type { FormProps } from '$lib/types';
  import { toast } from '$lib/state/toast.svelte';
  import { goto } from '$app/navigation';

  const { unmount, onCancel }: FormProps = $props();

  const form = new FormHandler('Create Tournament', {
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
    teamSize: {
      min: new F.Number('Min. team size').int().gte(1).lte(16),
      max: new F.Number('Max. team size').int().gte(2).lte(16)
    },
    isOpenRank: new F.Boolean('Is open rank?'),
    rankRange: {
      lower: new F.Number('Lower rank range limit').int().gte(1),
      upper: new F.Number('Upper rank range limit').optional().int().gte(1)
    }
  })
    .onSubmit(async (value) => {
      const created = await api.createTournament(fetch, {
        ...value,
        teamSize: value.type === 'solo' ? null : value.teamSize,
        rankRange: value.isOpenRank ? null : value.rankRange
      });

      await unmount();
      toast.add({
        type: 'success',
        message: 'Successfully created tournament!'
      });

      await goto(`/t/m/${created.urlSlug}`, {
        invalidateAll: true
      });
    })
    .onCancel(async () => {
      await onCancel?.();
      await unmount();
    });

  $effect(() => {
    const disable = form.fields.type.raw !== 'teams';
    form.fields.teamSize.max.disable(disable);
    form.fields.teamSize.min.disable(disable);
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
<Form {form}>
  <strong>Branding</strong>
  <Text field={form.fields.name} />
  <Text field={form.fields.acronym} />
  <Text field={form.fields.urlSlug} />
  <div class="line mt-4"></div>
  <strong>Format</strong>
  <Options field={form.fields.type} />
  <Number field={form.fields.teamSize.min} />
  <Number field={form.fields.teamSize.max} />
  <div class="line mt-4"></div>
  <strong>Rank Range</strong>
  <Boolean field={form.fields.isOpenRank} />
  <Number field={form.fields.rankRange.lower} />
  <Number field={form.fields.rankRange.upper} />
</Form>
