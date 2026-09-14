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

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:value': [number | undefined];
}>();

const isEditing = ref(false);
const inputValue = ref('');
const originalValue = ref<number | null>(null);

function handleFocus(event: Event) {
  isEditing.value = true;
  inputValue.value = (event.target as HTMLInputElement).value;
  originalValue.value = props.value ?? null;
}

function handleInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const limitedValue = limitDecimals(input.value);

  if (input.value !== limitedValue) {
    input.value = limitedValue;
  }

  inputValue.value = limitedValue;
  const digits = limitedValue.replace(/\D/g, '');

  const numericValue = digits ? parseNumberInput(limitedValue) : undefined;

  if (numericValue !== originalValue.value) {
    emit('update:value', numericValue);
  }
}

function handleBlur(event: Event): void {
  const input = event.target as HTMLInputElement;
  const limitedValue = limitDecimals(input.value);
  const digits = limitedValue.replace(/\D/g, '');

  if (!digits) {
    emit('update:value', undefined);

    inputValue.value = '';
    originalValue.value = null;
  } else {
    const numericValue = parseNumberInput(limitedValue);

    if (numericValue !== originalValue.value) {
      emit('update:value', numericValue);
    }

    inputValue.value = formatNumber(numericValue);
    originalValue.value = null;
  }

  isEditing.value = false;
}
</script>
