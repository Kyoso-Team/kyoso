<script lang="ts">
  import Tooltip from '$components/Tooltip.svelte';
  import Bold from '@lucide/svelte/icons/bold';
  import Code from '@lucide/svelte/icons/code';
  import Eye from '@lucide/svelte/icons/eye';
  import FileJson from '@lucide/svelte/icons/file-json';
  import Italic from '@lucide/svelte/icons/italic';
  import Link from '@lucide/svelte/icons/link';
  import List from '@lucide/svelte/icons/list';
  import ListOrdered from '@lucide/svelte/icons/list-ordered';
  import ListTodo from '@lucide/svelte/icons/list-todo';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Strikethrough from '@lucide/svelte/icons/strikethrough';
  import TextQuote from '@lucide/svelte/icons/text-quote';
  import { fade } from 'svelte/transition';
  import { showdown } from '$lib/showdown';
  import type { Component } from 'svelte';

  let {
    value = $bindable(''),
    // eslint-disable-next-line prefer-const
    oninput
  }: {
    value: string;
    oninput?: (() => void) | undefined;
  } = $props();
  let textareaElement: HTMLTextAreaElement | undefined = $state();
  let editing = $state(true);
  const formats: {
    tip: string;
    value: string;
    endValue?: string;
    icon: Component;
  }[] = [
    { tip: 'Bold', value: '**', icon: Bold },
    { tip: 'Italic', value: '_', icon: Italic },
    { tip: 'Strikethrough', value: '~~', icon: Strikethrough },
    { tip: 'Code', value: '`', icon: Code },
    { tip: 'Code block', value: '```\n', endValue: '\n```', icon: FileJson },
    { tip: 'Quote', value: '>', endValue: '', icon: TextQuote },
    { tip: 'Link', value: '[', endValue: 'label](url)', icon: Link },
    { tip: 'Unordered list', value: '- Item 1\n- Item 2', endValue: '', icon: List },
    { tip: 'Ordered list', value: '1. Item 1\n2. Item 2', endValue: '', icon: ListOrdered },
    { tip: 'Task list', value: '- [x] Complete\n- [ ] Todo', endValue: '', icon: ListTodo }
  ];

  function onFormatBtnClick(index: number) {
    if (!textareaElement) return;
    const { selectionStart, selectionEnd } = textareaElement;
    value =
      value.substring(0, selectionStart) +
      formats[index].value +
      value.substring(selectionStart, selectionEnd) +
      (formats[index].endValue ?? formats[index].value) +
      value.substring(selectionEnd);

    textareaElement.focus();
    setTimeout(() => {
      textareaElement!.setSelectionRange(
        selectionStart + formats[index].value.length,
        selectionStart + formats[index].value.length
      );
    }, 0);
  }

  function toggleEditing() {
    editing = !editing;
  }
</script>

<div class="border-surface-token-700-300 flex w-full flex-col rounded-md border">
  <div class="bg-surface-token-800-200 flex rounded-t-md p-1">
    <Tooltip>
      <button class="btn-icon-sm-contrast" onclick={toggleEditing}>
        {#if editing}
          <Eye size={16} />
        {:else}
          <Pencil size={16} />
        {/if}
      </button>
      <!-- {#snippet tip()}
        {editing ? 'Preview' : 'Edit'}
      {/snippet} -->
    </Tooltip>
    <div class="flex w-full justify-end">
      {#if editing}
        <div class="flex" transition:fade={{ duration: 75 }}>
          {#each formats as format, i}
            <Tooltip>
              <button
                class="btn-icon-sm-surface-soft bg-surface-token-800-200 border-0"
                onclick={() => onFormatBtnClick(i)}
              >
                <format.icon size={16} />
              </button>
              <!-- {#snippet tip()}
                {format.tip}
              {/snippet} -->
            </Tooltip>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  {#if editing}
    <textarea
      class="input !mt-0 h-64 resize-none rounded-t-none text-base"
      bind:value
      {oninput}
      bind:this={textareaElement}
    ></textarea>
  {:else}
    <div class="px-2 py-1">
      {#if value.length === 0}
        <p class="text-surface-token-200-800 italic">No content</p>
      {:else}
        <div class="from-markdown-content">
          {@html showdown.makeHtml(value)}
        </div>
      {/if}
    </div>
  {/if}
</div>
