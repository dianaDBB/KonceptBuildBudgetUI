<template>
  <input
    :value="formatNumber(value)"
    type="text"
    inputmode="decimal"
    :disabled="isDisabled"
    :class="{ required: isInvalid }"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
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

function handleInput(event: Event): void {
  const input = event.target as HTMLInputElement;

  const digits = input.value.replace(/\D/g, '');

  if (!digits) {
    emit('update:value', undefined);
    input.value = '';
    return;
  }

  const numericValue = Number(digits) / 100;

  emit('update:value', numericValue);

  input.value = formatNumber(numericValue);
}
</script>
