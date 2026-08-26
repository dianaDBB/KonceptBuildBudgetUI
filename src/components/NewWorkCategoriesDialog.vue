<template>
  <div v-if="modelValue" class="overlay" @click.self="cancel">
    <div class="dialog">
      <h2>Novas Especialidades</h2>

      <div v-if="categories.length === 0" class="row">
        <p>Não existem novas especialidades.</p>
      </div>

      <div v-else class="categories">
        <div class="row">
          <p>Seleccione as especialidades e sub-especialidades que pretende adicionar ao projeto.</p>
        </div>

        <div v-for="category in categories" :key="category.id" class="category">
          <label class="category-row">
            <CheckBox
              :value="isCategorySelected(category.id!)"
              :is-invalid="false"
              :is-disabled="false"
              @change="toggleCategory(category)"
            />
            <span>{{ category.description }}</span>
          </label>

          <div v-if="category.workItems?.length" class="work-items">
            <label v-for="workItem in category.workItems" :key="workItem.id" class="work-item-row">
              <CheckBox
                :value="isWorkItemSelected(workItem.id!)"
                :is-invalid="false"
                :is-disabled="false"
                @change="toggleWorkItem(category, workItem)"
              />

              <span class="work-item-description">{{ workItem.description }}</span>
              <span class="work-item-details"> {{ workItem.units }} · {{ formatCurrency(workItem.unitPrice) }}</span>
            </label>
          </div>
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
import { WorkCategoryType } from '@/entities/work-category';
import { WorkItemType } from '@/entities/work-item';
import { computed, reactive } from 'vue';
import CheckBox from './inputs/CheckBox.vue';
import { formatCurrency } from '@/utils/validation';

interface Props {
  modelValue: boolean;
  categories: WorkCategoryType[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', categories: WorkCategoryType[]): void;
}>();

const selectedCategoryIds = reactive(new Set<string>());
const selectedWorkItemIds = reactive(new Set<string>());

const hasSelection = computed(() => selectedCategoryIds.size > 0 || selectedWorkItemIds.size > 0);

function isCategorySelected(categoryId: string): boolean {
  return selectedCategoryIds.has(categoryId);
}

function isWorkItemSelected(workItemId: string): boolean {
  return selectedWorkItemIds.has(workItemId);
}

function toggleCategory(category: WorkCategoryType): void {
  if (selectedCategoryIds.has(category.id!)) {
    selectedCategoryIds.delete(category.id!);

    category.workItems?.forEach((workItem) => {
      selectedWorkItemIds.delete(workItem.id!);
    });

    return;
  }

  selectedCategoryIds.add(category.id!);
}

function toggleWorkItem(category: WorkCategoryType, workItem: WorkItemType): void {
  if (selectedWorkItemIds.has(workItem.id!)) {
    selectedWorkItemIds.delete(workItem.id!);
    return;
  }

  selectedWorkItemIds.add(workItem.id!);
  selectedCategoryIds.add(category.id!);
}

function cancel(): void {
  reset();

  emit('update:modelValue', false);
}

function confirm(): void {
  const selectedCategories = props.categories
    .filter((category) => selectedCategoryIds.has(category.id!))
    .map((category) => ({
      ...category,
      workItems: category.workItems?.filter((workItem) => selectedWorkItemIds.has(workItem.id!)),
    }));

  emit('confirm', selectedCategories);

  reset();

  emit('update:modelValue', false);
}

function reset(): void {
  selectedCategoryIds.clear();
  selectedWorkItemIds.clear();
}
</script>

<style scoped lang="scss">
.dialog {
  width: min(700px, calc(100vw - 40px));
  max-height: 80vh;
}

.categories {
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
}

.category {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 12px;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 10px;

  font-weight: 600;
  cursor: pointer;
}

.work-items {
  margin-top: 10px;
  margin-left: 28px;

  display: flex;
  flex-direction: column;
  gap: 8px;
}

.work-item-row {
  display: flex;
  align-items: center;
  gap: 10px;

  cursor: pointer;
}

.work-item-description {
  flex: 1;
}

.work-item-details {
  color: var(--color-text-muted);
  font-size: 12px;
}
</style>
