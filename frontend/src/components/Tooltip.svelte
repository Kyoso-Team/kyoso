<!-- Source: https://github.com/skeletonlabs/skeleton/tree/main/packages/skeleton-svelte/src/components/Tooltip -->
<!--
  MIT License

  Copyright (c) 2023 Skeleton Labs, LLC

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
-->

<script lang="ts">
	import { fade } from 'svelte/transition';
	import * as tooltip from '@zag-js/tooltip';
	import { useMachine, normalizeProps, mergeProps } from '@zag-js/svelte';
  import type { Snippet } from 'svelte';

  interface TooltipProps extends Omit<tooltip.Props, 'id' | 'open' | 'onOpenChange' | 'openDelay' | 'closeDelay' | 'closeOnPointerDown' | 'closeOnScroll' | 'closeOnClick' | 'closeOnEscape'> {
    position?: 'top' | 'right' | 'bottom' | 'left';
    /** Provide arbitrary classes for the root element. */
    class?: string;
    /** Set the aria-label for the trigger. */
    triggerAriaLabel?: string;
    // Snippets ---
    /** Provide the template contents inside the trigger button. */
    children: Snippet;
    /** Provide the template contents of the tooltip itself. */
    tip?: Snippet;
    // Events ---
    /** Handle the tooltip button hover event. */
    onmouseover?: () => void;
    /** Handle the tooltip button click event. */
    onclick?: () => void;
  }

	const {
		// Base
    position = 'top',
		class: classes = '',
		triggerAriaLabel = '',
		// Snippets
		children,
		tip,
		// Events
		onmouseover,
		onclick,
		// Zag ---
		...zagProps
	}: TooltipProps = $props();


	let open = $state(false);
	const id = [...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
	const service = useMachine(tooltip.machine, () => ({
		...zagProps,
    open,
    onOpenChange: (e) => (open = e.open),
		id: id,
    openDelay: 0,
    closeDelay: 0,
    closeOnPointerDown: false,
    closeOnScroll: false,
    closeOnClick: false,
    closeOnEscape: false,
    positioning: {
      ...zagProps.positioning,
      placement: position
    }
	}));
	const api = $derived(tooltip.connect(service, normalizeProps));
	const triggerProps = $derived(mergeProps(api.getTriggerProps(), { onmouseover, onclick }));
</script>

<span class="block {classes}" data-testid="tooltip">
	<!-- Snippet: Trigger -->
	{#if children}
		<button {...triggerProps} type="button" aria-label={triggerAriaLabel}>
			{@render children()}
		</button>
	{/if}
	<!-- Tooltip Content -->
	{#if api.open}
		<div {...api.getPositionerProps()} transition:fade={{ duration: 100 }} class="!top-[2px]">
			<!-- Arrow -->
      <div {...api.getArrowProps()}>
        <div {...api.getArrowTipProps()} class="dark:!bg-zinc-900 bg-zinc-100 border dark:border-zinc-700 border-zinc-300 border-b-0 border-r-0 !w-2 !h-2 !top-[1px]"></div>
      </div>
			<!-- Snippet Content -->
			<div {...api.getContentProps()} class="dark:bg-zinc-900 bg-zinc-100  border dark:border-zinc-700 border-zinc-300 dark:text-white text-black block px-3 py-1 text-sm  duration-150 rounded-md">
				{@render tip?.()}
			</div>
		</div>
	{/if}
</span>

<style>
	:global([data-part='arrow']) {
		--arrow-size: 10px;
		--arrow-background: white;
	}
</style>
