<template>
  <div v-if="modelValue" class="confirm-overlay" @click.self="cancel">
    <div class="confirm-dialog" role="dialog" aria-modal="true" :aria-labelledby="'confirm-title'">
      <div class="confirm-heading">
        <span class="confirm-icon" aria-hidden="true">
          <AlertTriangle :size="18" />
        </span>
        <h2 id="confirm-title">{{ title }}</h2>
      </div>

      <div v-for="item in message" :key="item" class="row">
        <p>{{ item }}</p>
      </div>

      <div class="confirm-actions">
        <button type="button" class="confirm-button cancel-button" @click="cancel">
          {{ cancelText }}
        </button>

        <button type="button" class="confirm-button confirm-button-danger" @click="confirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

interface Props {
  modelValue: boolean;
  title: string;
  message: string[];
  confirmText?: string;
  cancelText?: string;
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}>();

function cancel() {
  emit('update:modelValue', false);
}

function confirm() {
  emit('confirm');
  emit('update:modelValue', false);
}
</script>

<style>
.confirm-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.48);
  z-index: 9999;
}

.confirm-dialog {
  width: min(420px, 100%);
  padding: 20px;
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  background: var(--color-background);
  box-shadow: var(--shadow-pop);
}

.confirm-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.confirm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.confirm-heading h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.25;
}

.row + .row {
  margin-top: 8px;
}

.row p {
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.45;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.confirm-button {
  padding: 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.confirm-button:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.confirm-button-danger {
  border-color: var(--color-danger);
  background: var(--color-danger);
  color: white;
}

.confirm-button-danger:hover {
  border-color: var(--color-danger);
  background: #b91c1c;
  color: white;
}
</style>
