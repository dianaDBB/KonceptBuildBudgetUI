<template>
  <div v-if="modelValue" class="overlay" @click.self="cancel">
    <div class="dialog">
      <h2>Novos custos diretos</h2>

      <div v-if="indirectCosts.length === 0" class="row">
        <p>Não existem novos custos diretos.</p>
      </div>

      <div v-else class="indirect-costs">
        <div class="row">
          <p>Seleccione os custos diretos que pretende adicionar ao projeto.</p>
        </div>

        <div v-for="category in indirectCosts" :key="category.id" class="indirect-cost">
          <label class="indirect-cost-row">
            <CheckBox
              :value="isIndirectCostSelected(category.id!)"
              :is-invalid="false"
              :is-disabled="false"
              @change="toggleIndirectCost(category)"
            />
            <span>{{ category.description }}</span>
          </label>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="button" @click="cancel">Cancelar</button>
        <button type="button" class="button confirm" :disabled="!hasSelection" @click="confirm">Adicionar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import CheckBox from './inputs/CheckBox.vue';
import { IndirectCostType } from '@/entities/indirect-cost.ts';

interface Props {
  modelValue: boolean;
  indirectCosts: IndirectCostType[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', indirectCosts: IndirectCostType[]): void;
}>();

const selectedIndirectCostsIds = reactive(new Set<string>());

const hasSelection = computed(() => selectedIndirectCostsIds.size > 0);

function isIndirectCostSelected(indirectCostId: string): boolean {
  return selectedIndirectCostsIds.has(indirectCostId);
}

function toggleIndirectCost(indirectCost: IndirectCostType): void {
  if (selectedIndirectCostsIds.has(indirectCost.id!)) {
    selectedIndirectCostsIds.delete(indirectCost.id!);

    return;
  }

  selectedIndirectCostsIds.add(indirectCost.id!);
}

function cancel(): void {
  reset();

  emit('update:modelValue', false);
}

function confirm(): void {
  const selectedIndirectCosts = props.indirectCosts
    .filter((indirectCost) => selectedIndirectCostsIds.has(indirectCost.id!))
    .map((category) => ({
      ...category,
    }));

  emit('confirm', selectedIndirectCosts);

  reset();

  emit('update:modelValue', false);
}

function reset(): void {
  selectedIndirectCostsIds.clear();
}
</script>

<style scoped lang="scss">
.dialog {
  width: min(700px, calc(100vw - 40px));
  max-height: 80vh;
}

.indirect-costs {
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
}

.indirect-cost {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 12px;
}

.indirect-cost-row {
  display: flex;
  align-items: center;
  gap: 10px;

  font-weight: 600;
  cursor: pointer;
}
</style>
