<template>
  <input
    :value="isEditing ? inputValue : formatNumber(value)"
    type="text"
    inputmode="decimal"
    :disabled="isDisabled"
    :class="{ required: isInvalid }"
    @focus="handleFocus($event)"
    @input="handleInput($event)"
    @blur="handleBlur($event)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { limitDecimals, parseNumberInput } from '@/utils/handle-number-input';
import { formatNumber } from '@/utils/validation';

interface Props {
  entity: Record<string, unknown>;
  value: number | null | undefined;
  fieldKey: string;
  isInvalid: boolean;
  isDisabled: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:value': [value: number | undefined];
}>();

const isEditing = ref(false);
const inputValue = ref('');

function handleFocus(event: Event) {
  isEditing.value = true;
  inputValue.value = (event.target as HTMLInputElement).value;
}

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const limitedValue = limitDecimals(input.value);

  if (input.value !== limitedValue) {
    input.value = limitedValue;
  }

  inputValue.value = limitedValue;

  const numericValue = parseNumberInput(limitedValue);

  emit('update:value', numericValue);
}

function handleBlur(event: Event) {
  const input = event.target as HTMLInputElement;
  const numericValue = parseNumberInput(input.value);

  emit('update:value', numericValue);

  inputValue.value = formatNumber(numericValue);
  isEditing.value = false;
}
</script>
