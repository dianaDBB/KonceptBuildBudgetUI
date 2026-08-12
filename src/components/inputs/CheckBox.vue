<template>
  <input
    type="checkbox"
    :checked="value ?? false"
    :disabled="isDisabled"
    :class="{ required: isInvalid }"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
interface Props {
  value: boolean | null | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:value': [boolean];
}>();

function handleChange(event: Event) {
  const input = event.target as HTMLInputElement;

  emit('update:value', input.checked);
}
</script>
<style>
input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;

  width: 18px;
  height: 18px;

  margin: 0;

  display: grid;
  place-content: center;

  border: 1px solid var(--color-border);
  border-radius: 4px;

  background: var(--color-background);

  cursor: pointer;

  transition: background-color 0.2s, border-color 0.2s;
}

input[type='checkbox']::before {
  content: '';

  width: 4px;
  height: 7px;

  border-right: 1.5px solid var(--color-background);
  border-bottom: 1.5px solid var(--color-background);

  transform: rotate(45deg) scale(0);
  transition: transform 0.15s ease;
}

input[type='checkbox']:checked {
  background: var(--color-text-secondary);
  border-color: var(--color-text-secondary);
}

input[type='checkbox']:checked::before {
  transform: rotate(45deg) scale(1);
}

input[type='checkbox']:disabled {
  background: var(--color-background-disabled);
  border-color: var(--color-border);

  cursor: not-allowed;
  opacity: 0.7;
}

input[type='checkbox']:focus-visible {
  outline: 2px solid var(--color-border);
  outline-offset: 2px;
}
</style>
