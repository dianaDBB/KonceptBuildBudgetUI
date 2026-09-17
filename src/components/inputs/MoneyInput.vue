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

function handleFocus(event: Event) {
  isEditing.value = true;
  inputValue.value = (event.target as HTMLInputElement).value;
  originalValue.value = props.value ?? null;
}

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;

  // Only allow numbers and decimal separators
  let sanitizedValue = input.value.replace(/[^\d.,]/g, '');

  // Limit integer part to 8 digits
  const separatorIndex = sanitizedValue.search(/[.,]/);

  if (separatorIndex !== -1) {
    const integerPart = sanitizedValue.slice(0, separatorIndex);
    const decimalPart = sanitizedValue.slice(separatorIndex);

    sanitizedValue = integerPart.slice(0, 8) + decimalPart;
  } else {
    sanitizedValue = sanitizedValue.slice(0, 8);
  }

  const limitedValue = limitDecimals(sanitizedValue);

  if (input.value !== limitedValue) {
    input.value = limitedValue;
  }

  inputValue.value = limitedValue;

  const numericValue = parseNumberInput(limitedValue);

  if (numericValue !== originalValue.value) {
    emit('update:value', numericValue);
  }
}

function handleBlur(event: Event) {
  const input = event.target as HTMLInputElement;
  const numericValue = parseNumberInput(input.value);

  if (numericValue !== originalValue.value) {
    emit('update:value', numericValue);
  }

  inputValue.value = formatNumber(numericValue);
  isEditing.value = false;
  originalValue.value = null;
}
</script>
