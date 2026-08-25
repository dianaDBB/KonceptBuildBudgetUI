<template>
  <div class="work-categories">
    <!-- Work Categories -->
    <div
      v-for="category in modelValue"
      :key="category.id"
      class="category-group"
      :class="{
        'drop-category-before': isDropBeforeCategory(category),
        'drop-category-after': isDropAfterCategory(category),
      }"
    >
      <!-- Category row -->
      <div
        class="work-category"
        :class="{
          dragging: isDraggingCategory(category),
        }"
        @dragover.prevent="handleCategoryDragOver(category, $event)"
        @drop.prevent="dropCategory(category)"
      >
        <div
          class="drag-handle drag-column"
          draggable="true"
          title="Arrastar especialidade"
          @dragstart.stop="startCategoryDrag(category, $event)"
          @dragend.stop="endDrag"
          @click.stop
        >
          <GripVertical :size="16" />
        </div>

        <div class="category-content">
          <CheckBox
            :value="category.isIncluded"
            :is-invalid="false"
            :is-disabled="false"
            @click.stop
            @update:value="updateCategoryIncluded(category, $event)"
          />

          <TextInput
            class="category-input"
            :value="category.description"
            :is-invalid="!category.description"
            :is-disabled="false"
            @click.stop
            @update:value="category.description = $event"
          />

          <div class="margin-wrapper">
            <PercentageInput
              class="margin-input"
              :value="category.margin"
              :is-invalid="false"
              :is-disabled="false"
              @click.stop
              @update:value="category.margin = $event"
            />

            <span class="percentage-symbol"> % </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { GripVertical } from 'lucide-vue-next';

import CheckBox from './inputs/CheckBox.vue';
import TextInput from './inputs/TextInput.vue';
import PercentageInput from './inputs/PercentageInput.vue';

import { ProjectWorkCategoryType, ProjectWorkItemType } from '@/entities/project';

const props = defineProps<{
  modelValue: ProjectWorkCategoryType[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ProjectWorkCategoryType[]];
}>();

/************************************************************************************************************** STATE */

const draggedCategory = ref<ProjectWorkCategoryType | null>(null);

const draggedItem = ref<{
  category: ProjectWorkCategoryType;
  item: ProjectWorkItemType;
} | null>(null);

const dropTarget = ref<{
  type: 'category' | 'item';
  id: string;
  position: 'before' | 'after';
} | null>(null);

/************************************************************************************************************ INCLUDE */

function updateCategoryIncluded(category: ProjectWorkCategoryType, included: boolean): void {
  category.isIncluded = included;

  category.workItems?.forEach((item) => {
    item.isIncluded = included;
  });
}

/*********************************************************************************************** CATEGORY DRAG & DROP */

function isDraggingCategory(category: ProjectWorkCategoryType): boolean {
  return draggedCategory.value?.id === category.id;
}

function isDropBeforeCategory(category: ProjectWorkCategoryType): boolean {
  return (
    dropTarget.value?.type === 'category' &&
    dropTarget.value.id === category.id &&
    dropTarget.value.position === 'before'
  );
}

function isDropAfterCategory(category: ProjectWorkCategoryType): boolean {
  return (
    dropTarget.value?.type === 'category' &&
    dropTarget.value.id === category.id &&
    dropTarget.value.position === 'after'
  );
}

function startCategoryDrag(category: ProjectWorkCategoryType, event: DragEvent): void {
  draggedCategory.value = category;
  draggedItem.value = null;
  dropTarget.value = null;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', category.id ?? '');
  }
}

function handleCategoryDragOver(targetCategory: ProjectWorkCategoryType, event: DragEvent): void {
  if (!draggedCategory.value) {
    return;
  }

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  if (draggedCategory.value.id === targetCategory.id) {
    dropTarget.value = null;
    return;
  }

  const element = event.currentTarget as HTMLElement;

  const rect = element.getBoundingClientRect();

  const middle = rect.top + rect.height / 2;

  dropTarget.value = {
    type: 'category',
    id: targetCategory.id!,
    position: event.clientY < middle ? 'before' : 'after',
  };
}

function dropCategory(targetCategory: ProjectWorkCategoryType): void {
  const dragged = draggedCategory.value;
  const target = dropTarget.value;

  if (!dragged || !target || target.type !== 'category' || dragged.id === targetCategory.id) {
    endDrag();
    return;
  }

  const categories = [...props.modelValue];

  const sourceIndex = categories.findIndex((category) => category.id === dragged.id);

  if (sourceIndex === -1) {
    endDrag();
    return;
  }

  const [movedCategory] = categories.splice(sourceIndex, 1);

  const targetIndex = categories.findIndex((category) => category.id === targetCategory.id);

  if (targetIndex === -1) {
    endDrag();
    return;
  }

  const insertIndex = target.position === 'before' ? targetIndex : targetIndex + 1;

  categories.splice(insertIndex, 0, movedCategory);

  emit(
    'update:modelValue',
    categories.map((category, index) => ({
      ...category,
      index,
    })),
  );

  endDrag();
}

/*************************************************************************************************************** DRAG */

function endDrag(): void {
  draggedCategory.value = null;
  draggedItem.value = null;
  dropTarget.value = null;
}
</script>

<style lang="scss">
.work-categories {
  width: 100%;

  border: 1px solid var(--color-border);
  border-radius: 5px;

  overflow: hidden;
}

/****************************************************************************************************** WORK CATEGORY */

.category-group {
  position: relative;
}

.work-category {
  display: grid;
  grid-template-columns: 64px 1fr;

  align-items: center;

  min-height: 40px;
  padding: 0 10px;

  position: relative;

  background: var(--color-background);

  border-bottom: 1px solid var(--color-border-light);
}

.work-category.dragging {
  opacity: 0.45;
}

.category-content {
  display: grid;
  grid-template-columns: 20px 220px auto 32px;

  align-items: center;
  gap: 8px;
}

.category-input {
  width: 220px;
  height: 26px;

  font-size: 11px;
  font-weight: 600;
}

.margin-wrapper {
  display: flex;
  align-items: center;
  gap: 2px;
}

.margin-input {
  width: 55px;
  height: 26px;

  font-size: 11px;
}

.percentage-symbol {
  font-size: 11px;
  color: var(--color-text-muted);
}

.expand-button {
  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-text-muted);

  cursor: pointer;
}

.expand-button:hover {
  color: var(--color-text);
}

/********************************************************************************************************* WORK ITEMS */

.work-items {
  position: relative;

  padding: 4px 0 10px 32px;

  background: var(--color-background);
}

.work-items::before {
  content: '';

  position: absolute;

  top: 0;
  bottom: 10px;
  left: 24px;

  border-left: 1px solid var(--color-border-light);

  pointer-events: none;
}

.work-item {
  display: grid;
  grid-template-columns: 32px 1fr;

  align-items: center;

  min-height: 54px;
  padding: 6px 10px;

  position: relative;

  background: linear-gradient(var(--color-border-light), var(--color-border-light)) 0 50% / 8px 1px no-repeat;
}

.work-item.dragging {
  opacity: 0.45;
}

.work-item + .work-item {
  margin-top: 4px;
}

.work-item.last-item {
  padding-bottom: 10px;

  border-bottom: 1px solid var(--color-border);
}

.item-content {
  display: grid;
  grid-template-columns: 20px 220px 1fr;

  align-items: center;
  gap: 8px;
}

.item-input {
  width: 220px;
  height: 26px;

  font-size: 11px;

  color: var(--color-text-secondary);
}

.detail-input {
  width: 100%;
  height: 42px;

  padding: 5px 7px;

  box-sizing: border-box;

  resize: none;

  font-family: inherit;
  font-size: 11px;
  line-height: 16px;

  color: var(--color-text-secondary);
}

/******************************************************************************************************** DRAG & DROP */

.drag-column {
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 24px;

  color: var(--color-text-muted);

  cursor: grab;
}

.drag-handle:hover {
  color: var(--color-text);
}

.drag-handle:active {
  cursor: grabbing;
}

.work-category.dragging,
.work-item.dragging {
  opacity: 0.45;
}

.category-group.drop-category-before::before,
.category-group.drop-category-after::after {
  content: '';

  position: absolute;

  left: 0;
  right: 0;

  height: 3px;

  background: var(--color-primary);

  border-radius: 2px;

  z-index: 20;

  pointer-events: none;
}

.category-group.drop-category-before::before {
  top: -1px;
}

.category-group.drop-category-after::after {
  bottom: -1px;
}

.work-item.drop-before::before,
.work-item.drop-after::after {
  content: '';

  position: absolute;

  left: 0;
  right: 0;

  height: 2px;

  background: var(--color-primary);

  z-index: 20;

  pointer-events: none;
}

.work-item.drop-before::before {
  top: -1px;
}

.work-item.drop-after::after {
  bottom: -1px;
}
</style>
