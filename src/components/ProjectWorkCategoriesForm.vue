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

          <div v-if="hasWorkItems(category)" class="expand-button" @click.stop="toggleCategory(category)">
            <ChevronDown v-if="isCategoryExpanded(category)" :size="16" />

            <ChevronRight v-else :size="16" />
          </div>
        </div>
      </div>

      <!-- Work items -->
      <div v-if="isCategoryExpanded(category)" class="work-items">
        <div
          v-for="(item, itemIndex) in category.workItems"
          :key="item.id"
          class="work-item"
          :class="{
            dragging: isDraggingItem(item),
            'drop-before': isDropBeforeItem(item),
            'drop-after': isDropAfterItem(item),
            'last-item':
              itemIndex ===
              category.workItems!.length - 1,
          }"
          @dragover.prevent="handleItemDragOver(category, item, $event)"
          @drop.prevent="dropItem(category, item)"
        >
          <div class="drag-column">
            <div
              class="drag-handle"
              draggable="true"
              title="Arrastar subespecialidade"
              @dragstart.stop="startItemDrag(category, item, $event)"
              @dragend.stop="endDrag"
              @click.stop
            >
              <GripVertical :size="14" />
            </div>
          </div>

          <div class="item-content">
            <CheckBox
              :value="item.isIncluded"
              :is-invalid="false"
              :is-disabled="!category.isIncluded"
              @update:value="item.isIncluded = $event"
            />

            <TextInput
              class="item-input"
              :value="item.description"
              :is-invalid="!item.description"
              :is-disabled="!category.isIncluded"
              @update:value="item.description = $event"
            />

            <TextArea
              class="detail-input"
              :value="item.detail ?? ''"
              :is-invalid="!item.detail"
              :is-disabled="!category.isIncluded"
              @update:value="item.detail = $event"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-vue-next';

import CheckBox from './inputs/CheckBox.vue';
import TextInput from './inputs/TextInput.vue';
import TextArea from './inputs/TextArea.vue';
import PercentageInput from './inputs/PercentageInput.vue';

import { ProjectWorkCategoryType, ProjectWorkItemType } from '@/entities/project';

const props = defineProps<{
  modelValue: ProjectWorkCategoryType[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ProjectWorkCategoryType[]];
}>();

/************************************************************************************************************** STATE */

const expandedCategories = ref<Set<string>>(new Set());

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

/*********************************************************************************************************** CATEGORY */

function hasWorkItems(category: ProjectWorkCategoryType): boolean {
  return !!category.workItems?.length;
}

function isCategoryExpanded(category: ProjectWorkCategoryType): boolean {
  return expandedCategories.value.has(category.id!);
}

function toggleCategory(category: ProjectWorkCategoryType): void {
  if (!hasWorkItems(category)) {
    return;
  }

  const categoryId = category.id!;

  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId);
  } else {
    expandedCategories.value.add(categoryId);
  }
}

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

/*************************************************************************************************** ITEM DRAG & DROP */

function isDraggingItem(item: ProjectWorkItemType): boolean {
  return draggedItem.value?.item.id === item.id;
}

function isDropBeforeItem(item: ProjectWorkItemType): boolean {
  return dropTarget.value?.type === 'item' && dropTarget.value.id === item.id && dropTarget.value.position === 'before';
}

function isDropAfterItem(item: ProjectWorkItemType): boolean {
  return dropTarget.value?.type === 'item' && dropTarget.value.id === item.id && dropTarget.value.position === 'after';
}

function startItemDrag(category: ProjectWorkCategoryType, item: ProjectWorkItemType, event: DragEvent): void {
  draggedItem.value = {
    category,
    item,
  };

  draggedCategory.value = null;
  dropTarget.value = null;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.id ?? '');
  }
}

function handleItemDragOver(
  category: ProjectWorkCategoryType,
  targetItem: ProjectWorkItemType,
  event: DragEvent,
): void {
  const dragged = draggedItem.value;

  if (!dragged) {
    return;
  }

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  if (dragged.category.id !== category.id) {
    dropTarget.value = null;
    return;
  }

  if (dragged.item.id === targetItem.id) {
    dropTarget.value = null;
    return;
  }

  const element = event.currentTarget as HTMLElement;

  const rect = element.getBoundingClientRect();

  const middle = rect.top + rect.height / 2;

  dropTarget.value = {
    type: 'item',
    id: targetItem.id!,
    position: event.clientY < middle ? 'before' : 'after',
  };
}

function dropItem(category: ProjectWorkCategoryType, targetItem: ProjectWorkItemType): void {
  const dragged = draggedItem.value;
  const target = dropTarget.value;

  if (
    !dragged ||
    !target ||
    target.type !== 'item' ||
    dragged.category.id !== category.id ||
    dragged.item.id === targetItem.id
  ) {
    endDrag();
    return;
  }

  const items = [...(category.workItems ?? [])];

  const sourceIndex = items.findIndex((item) => item.id === dragged.item.id);

  if (sourceIndex === -1) {
    endDrag();
    return;
  }

  const [movedItem] = items.splice(sourceIndex, 1);

  const targetIndex = items.findIndex((item) => item.id === targetItem.id);

  if (targetIndex === -1) {
    endDrag();
    return;
  }

  const insertIndex = target.position === 'before' ? targetIndex : targetIndex + 1;

  items.splice(insertIndex, 0, movedItem);

  category.workItems = items.map((item, index) => ({
    ...item,
    index,
  }));

  emit('update:modelValue', [...props.modelValue]);

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
