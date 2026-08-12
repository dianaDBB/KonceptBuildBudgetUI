<template>
  <input
    :value="formatIntNumber(value)"
    type="text"
    inputmode="numeric"
    :disabled="isDisabled"
    :class="{ required: isInvalid }"
    @input="handleInput($event)"
  />
</template>

<script setup lang="ts">
import { formatIntNumber } from '@/utils/validation';

interface Props {
  entity: Record<string, unknown>;
  value: number | null | undefined;
  fieldKey: string;
  isInvalid: boolean;
  isDisabled: boolean;
}

const props = defineProps<Props>();

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '');
  const numericValue = Number(digits);

  (props.entity as Record<string, number | null | undefined>)[props.fieldKey] = numericValue;
  input.value = formatIntNumber(numericValue);
}
</script>
