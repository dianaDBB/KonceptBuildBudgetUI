<template>
  <div class="form-grid">
    <div
      v-for="category in modelValue"
      :key="category.id"
      class="work-category"
      :class="{
        dragging: isDraggingCategory(category),
        'drop-before': isDropBeforeCategory(category),
        'drop-after': isDropAfterCategory(category),
      }"
      @dragover.prevent="handleCategoryDragOver(category, $event)"
      @drop.prevent="dropCategory(category)"
    >
      <!-- work category -->
      <div
        class="work-category-header"
        :class="{ expandable: hasWorkItems(category) }"
        @click="toggleCategory(category)"
      >
        <div
          class="drag-handle"
          draggable="true"
          title="Arrastar especialidade"
          @dragstart.stop="startCategoryDrag(category)"
          @dragend.stop="endDrag"
          @click.stop
        >
          <GripVertical :size="16" />
        </div>

        <div class="work-category-title">
          <CheckBox
            :value="category.isIncluded"
            :is-invalid="false"
            :is-disabled="false"
            @click.stop
            @update:value="updateCategoryIncluded(category, $event)"
          />

          <TextInput
            class="compact-input-header"
            :value="category.description"
            :is-invalid="!category.description"
            :is-disabled="false"
            @click.stop
            @update:value="category.description = $event"
          />

          <PercentageInput
            class="compact-input-header"
            :value="category.margin"
            :is-invalid="!category.margin"
            :is-disabled="false"
            @click.stop
            @update:value="category.margin = $event"
          />
        </div>

        <template v-if="hasWorkItems(category)">
          <ChevronDown v-if="isCategoryExpanded(category)" :size="16" />
          <ChevronRight v-else :size="16" />
        </template>
      </div>

      <!-- Work items -->
      <div v-if="isCategoryExpanded(category)" class="work-items">
        <div
          v-for="item in category.workItems"
          :key="item.id"
          class="work-item"
          :class="{
            dragging: isDraggingItem(item),
            'drop-before': isDropBeforeItem(item),
            'drop-after': isDropAfterItem(item),
          }"
          @dragover.prevent="handleItemDragOver(category, item, $event)"
          @drop.prevent="dropItem(category, item)"
        >
          <div
            class="drag-handle"
            draggable="true"
            title="Arrastar subespecialidade"
            @dragstart.stop="startItemDrag(category, item)"
            @dragend.stop="endDrag"
            @click.stop
          >
            <GripVertical :size="16" />
          </div>

          <CheckBox
            :value="item.isIncluded"
            :is-invalid="false"
            :is-disabled="!category.isIncluded"
            @update:value="item.isIncluded = $event"
          />

          <TextInput
            class="compact-input"
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
          ></TextArea>
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
import { ProjectWorkCategoryType, ProjectWorkItemType } from '@/entities/project';
import TextArea from './inputs/TextArea.vue';
import PercentageInput from './inputs/PercentageInput.vue';

const props = defineProps<{ modelValue: ProjectWorkCategoryType[] }>();

const emit = defineEmits<{ 'update:modelValue': [value: ProjectWorkCategoryType[]] }>();

/************************************************************************************************************** STATE */

const expandedCategories = ref<Set<string>>(new Set());

const draggedCategory = ref<ProjectWorkCategoryType | null>(null);

const draggedItem = ref<{ category: ProjectWorkCategoryType; item: ProjectWorkItemType } | null>(null);

const dropTarget = ref<{ type: 'category' | 'item'; id: string; position: 'before' | 'after' } | null>(null);

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

function startCategoryDrag(category: ProjectWorkCategoryType): void {
  draggedCategory.value = category;
  draggedItem.value = null;
  dropTarget.value = null;
}

function handleCategoryDragOver(targetCategory: ProjectWorkCategoryType, event: DragEvent): void {
  if (!draggedCategory.value) {
    return;
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

function startItemDrag(category: ProjectWorkCategoryType, item: ProjectWorkItemType): void {
  draggedItem.value = {
    category,
    item,
  };

  draggedCategory.value = null;
  dropTarget.value = null;
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
/* Work Category */

.work-category {
  position: relative;
  display: flex;
  flex-direction: column;

  border: 1px solid var(--color-border);
  border-radius: 4px;

  background: transparent;
  overflow: visible;
}

.work-category-header {
  display: flex;
  align-items: center;
  gap: 6px;

  min-height: 32px;
  padding: 6px 10px;
}

.work-category-header.expandable {
  cursor: pointer;
}

.work-category-title {
  display: flex;
  align-items: center;
  gap: 8px;

  min-width: 0;
  flex: 1;
}

/* Drag&Drop */

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

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
  opacity: 0.5;
}

.work-category.drop-before::before,
.work-category.drop-after::after,
.work-item.drop-before::before,
.work-item.drop-after::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
  z-index: 10;
}

.work-category.drop-before::before,
.work-item.drop-before::before {
  top: -2px;
}

.work-category.drop-after::after,
.work-item.drop-after::after {
  bottom: -2px;
}

/* Work Items */

.work-items {
  display: flex;
  flex-direction: column;

  padding: 6px 10px;
}

.work-item {
  position: relative;

  display: grid;
  grid-template-columns: 20px 20px 1fr 1fr;
  padding: 6px 0;
  gap: 6px;

  border-bottom: 1px solid var(--color-border-light);
}

.work-item:last-child {
  border-bottom: none;
}

/* Fields */

.compact-input-header {
  width: 300px;
  height: 28px;

  font-family: inherit;
  font-size: 12px;
  font-weight: 600;

  background: none;
  border: 1px solid var(--color-border);
  border-radius: 5px;
}

.compact-input {
  height: 28px;
  width: 300px;

  font-family: inherit;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.detail-input {
  width: 100%;
  min-height: 56px;
  padding: 5px 8px;
  resize: vertical;
  box-sizing: border-box;

  font-family: inherit;
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
