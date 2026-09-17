<template>
  <input
    :value="isEditing ? inputValue : formatIntNumber(value)"
    type="text"
    inputmode="numeric"
    :disabled="isDisabled"
    :class="{ required: isInvalid }"
    @focus="handleFocus($event)"
    @input="handleInput($event)"
    @blur="handleBlur($event)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { formatIntNumber } from '@/utils/validation';

interface Props {
  value: number | null | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:value': [value: number | undefined];
}>();

const isEditing = ref(false);
const inputValue = ref('');
const originalValue = ref<number | null>(null);

function handleFocus(_event: Event) {
  isEditing.value = true;
  inputValue.value = props.value?.toString() ?? '';
  originalValue.value = props.value ?? null;
}

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;

  // Only allow positive integers, max 8 digits
  const digits = input.value.replace(/\D/g, '').slice(0, 8);

  input.value = digits;
  inputValue.value = digits;

  const numericValue = digits === '' ? undefined : Number(digits);

  if (numericValue !== originalValue.value) {
    emit('update:value', numericValue);
  }
}

function handleBlur(event: Event) {
  const input = event.target as HTMLInputElement;
  const numericValue = Number(input.value);

  if (numericValue !== originalValue.value) {
    emit('update:value', numericValue);
  }

  inputValue.value = formatIntNumber(numericValue);
  isEditing.value = false;
  originalValue.value = null;
}
</script>
