<template>
  <div v-if="modelValue" class="overlay" @click.self="cancel">
    <div class="dialog">
      <h2>Novas Especialidades</h2>

      <div v-if="categories.length === 0" class="row">
        <p>Não existem novas especialidades ou atualizações pendentes.</p>
      </div>

      <div v-else class="categories">
        <div class="row">
          <p>Seleccione as especialidades e sub-especialidades que pretende adicionar ou atualizar no projeto.</p>
        </div>

        <div v-for="category in categories" :key="category.id" class="category">
          <label class="category-row">
            <CheckBox
              :value="isCategorySelected(category.id!)"
              :is-invalid="false"
              :is-disabled="false"
              @change="toggleCategory(category)"
            />

            <div class="desc-container">
              <div
                v-if="category.status === 'UPDATED' && category.currentDescription !== category.newDescription"
                class="diff-desc"
              >
                <span class="old-desc">{{ category.currentDescription }}</span>
                <span class="arrow">→</span>
                <span class="new-desc">{{ category.newDescription }}</span>
              </div>
              <span v-else class="new-desc">{{ category.newDescription }}</span>
            </div>

            <span v-if="category.status" :class="['badge', category.status.toLowerCase()]">
              {{ category.status === 'NEW' ? 'NOVA' : 'ACTUALIZADA' }}
            </span>
          </label>

          <div v-if="category.workItems?.length" class="work-items">
            <label v-for="workItem in category.workItems" :key="workItem.id" class="work-item-row">
              <CheckBox
                :value="isWorkItemSelected(workItem.id!)"
                :is-invalid="false"
                :is-disabled="false"
                @change="toggleWorkItem(category, workItem)"
              />

              <div class="desc-container work-item-description">
                <div
                  v-if="workItem.status === 'UPDATED' && workItem.currentDescription !== workItem.newDescription"
                  class="diff-desc"
                >
                  <span class="old-desc">{{ workItem.currentDescription }}</span>
                  <span class="arrow">→</span>
                  <span class="new-desc">{{ workItem.newDescription }}</span>
                </div>
                <span v-else class="new-desc">{{ workItem.newDescription }}</span>
              </div>

              <span v-if="workItem.status" :class="['badge', 'small', workItem.status.toLowerCase()]">
                {{ workItem.status === 'NEW' ? 'NOVA' : 'ACTUALIZADA' }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="button" @click="cancel">Cancelar</button>
        <button type="button" class="button confirm" :disabled="!hasSelection" @click="confirm">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NewWorkCategoryType } from '@/entities/work-category';
import { NewWorkItemType } from '@/entities/work-item';
import { computed, reactive } from 'vue';
import CheckBox from './inputs/CheckBox.vue';

interface Props {
  modelValue: boolean;
  categories: NewWorkCategoryType[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', categories: NewWorkCategoryType[]): void;
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

function toggleCategory(category: NewWorkCategoryType): void {
  if (selectedCategoryIds.has(category.id!)) {
    selectedCategoryIds.delete(category.id!);

    category.workItems?.forEach((workItem) => {
      selectedWorkItemIds.delete(workItem.id!);
    });

    return;
  }

  selectedCategoryIds.add(category.id!);
  category.workItems?.forEach((workItem) => {
    selectedWorkItemIds.add(workItem.id!);
  });
}

function toggleWorkItem(category: NewWorkCategoryType, workItem: NewWorkItemType): void {
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
  height: min(80vh, calc(100vh - 40px));
  max-height: 80vh;

  display: flex;
  flex-direction: column;
}

.categories {
  flex: 1;
  min-height: 0;
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

.desc-container {
  flex: 1;
  min-width: 0;
}

.diff-desc {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;

  .old-desc {
    color: var(--color-text-muted);
    text-decoration: line-through;
  }

  .arrow {
    color: var(--color-text-muted);
    font-size: 12px;
  }

  .new-desc {
    color: var(--color-text);
  }
}

.work-item-description {
  flex: 1;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;

  &.new {
    background-color: #dcfce7;
    color: #15803d;
  }

  &.updated {
    background-color: #fef3c7;
    color: #b45309;
  }

  &.small {
    font-size: 10px;
    padding: 1px 6px;
  }
}
</style>
