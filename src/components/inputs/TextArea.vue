<template>
  <textarea
    :value="value"
    type="text"
    :disabled="isDisabled"
    :class="{ required: isInvalid }"
    @input="emit('update:value', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
interface Props {
  value: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:value': [string];
}>();
</script>

<style>
textarea {
  resize: vertical;
  min-height: 50px;
  max-height: 200px;
}
</style>
