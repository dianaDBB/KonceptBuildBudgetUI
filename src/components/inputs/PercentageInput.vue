<template>
  <input
    :value="isEditing ? inputValue : formatNumber(value)"
    type="text"
    inputmode="decimal"
    :disabled="isDisabled"
    :class="{ required: isInvalid }"
    @focus="handleFocus($event)"
    @input="handleInput"
    @blur="handleBlur($event)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { limitDecimals, parseNumberInput } from '@/utils/handle-number-input';
import { formatNumber } from '@/utils/validation';

interface Props {
  value: number | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:value': [number | undefined];
}>();

const isEditing = ref(false);
const inputValue = ref('');

function handleFocus(event: Event) {
  isEditing.value = true;
  inputValue.value = (event.target as HTMLInputElement).value;
}

function handleInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const limitedValue = limitDecimals(input.value);

  if (input.value !== limitedValue) {
    input.value = limitedValue;
  }

  inputValue.value = limitedValue;
  const digits = limitedValue.replace(/\D/g, '');

  emit('update:value', digits ? parseNumberInput(limitedValue) : undefined);
}

function handleBlur(event: Event): void {
  const input = event.target as HTMLInputElement;
  const limitedValue = limitDecimals(input.value);
  const digits = limitedValue.replace(/\D/g, '');

  if (!digits) {
    emit('update:value', undefined);
    inputValue.value = '';
  } else {
    const numericValue = parseNumberInput(limitedValue);

    emit('update:value', numericValue);
    inputValue.value = formatNumber(numericValue);
  }

  isEditing.value = false;
}
</script>
