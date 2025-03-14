<script lang="ts">
  import Bold from '@lucide/svelte/icons/bold';
  import Italic from '@lucide/svelte/icons/italic';
  import Strikethrough from '@lucide/svelte/icons/strikethrough';
  import Code from '@lucide/svelte/icons/code';
  import FileJson from '@lucide/svelte/icons/file-json';
  import TextQuote from '@lucide/svelte/icons/text-quote';
  import Link from '@lucide/svelte/icons/link';
  import Eye from '@lucide/svelte/icons/eye';
  import Pencil from '@lucide/svelte/icons/pencil';
  import ListOrdered from '@lucide/svelte/icons/list-ordered';
  import List from '@lucide/svelte/icons/list';
  import ListTodo from '@lucide/svelte/icons/list-todo';
  import { fade } from 'svelte/transition';
  import { showdown } from '$lib/showdown';
  import type { Component } from 'svelte';

  // eslint-disable-next-line prefer-const
  let { value = $bindable(''), oninput }: {
    value: string;
    oninput?: (() => void) | undefined;
  } = $props();
  let textareaElement: HTMLTextAreaElement | undefined = $state();
  let editing = $state(true);
  const formats: {
    value: string;
    endValue?: string;
    icon: Component;
  }[] = [
    { value: '**', icon: Bold },
    { value: '_', icon: Italic },
    { value: '~~', icon: Strikethrough },
    { value: '`', icon: Code },
    { value: '```\n', endValue: '\n```', icon: FileJson },
    { value: '>', endValue: '', icon: TextQuote },
    { value: '[', endValue: 'label](url)', icon: Link },
    { value: '- Item 1\n- Item 2', endValue: '', icon: List },
    { value: '1. Item 1\n2. Item 2', endValue: '', icon: ListOrdered },
    { value: '- [x] Complete\n- [ ] Todo', endValue: '', icon: ListTodo }
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
      textareaElement!.setSelectionRange(selectionStart + formats[index].value.length, selectionStart + formats[index].value.length);
    }, 0);
  }

  function toggleEditing() {
    editing = !editing;
  }
</script>

<div class="w-full flex flex-col border border-surface-token-700-300 rounded-md">
  <div class="flex bg-surface-token-800-200 p-1 rounded-t-md">
    <button class="btn-icon-sm-contrast" onclick={toggleEditing}>
      {#if editing}
        <Eye size={16} />
      {:else}
        <Pencil size={16} />
      {/if}
    </button>
    <div class="w-full flex justify-end">
      {#if editing}
        <div class="flex" transition:fade={{ duration: 75 }}>
          {#each formats as format, i}
            <button
              class="btn-icon-sm-surface-soft bg-surface-token-800-200 border-0"
              onclick={() => onFormatBtnClick(i)}
            >
              <format.icon size={16} />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  {#if editing}
    <textarea class="input resize-none text-base h-64 !mt-0 rounded-t-none" bind:value={value} oninput={oninput} bind:this={textareaElement}></textarea>
  {:else}
    <div class="py-1 px-2">
      {#if value.length === 0}
        <p class="italic text-surface-token-200-800">No content</p>
      {:else}
        <div class="from-markdown-content">
          {@html showdown.makeHtml(value)}
        </div>
      {/if}
    </div>
  {/if}
</div>