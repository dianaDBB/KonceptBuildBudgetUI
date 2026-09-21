<template>
  <div class="tab-view">
    <div v-if="apiStatus.isLoading" class="loading-overlay">
      <div>
        <LoaderCircle :size="18" class="spinner" />
        A carregar projeto...
      </div>
    </div>

    <div class="tab-content">
      <div class="tab-body">
        <div class="table-container">
          <div class="table">
            <table>
              <colgroup>
                <!--reorder column-->
                <col style="width: 20px" />
                <!--expand column-->
                <col style="width: 50px" />
                <col
                  v-for="config in Object.values(workCategoryConfigs)"
                  :key="config.label"
                  :style="config.styleConfig.columnStyle"
                />
              </colgroup>
              <thead>
                <tr>
                  <!--reorder column-->
                  <th></th>
                  <!--expand column-->
                  <th>
                    <component class="btn-icon-sm" :is="Plus" :size="10" @click="expandAll" />
                    <component class="btn-icon-sm" :is="Minus" :size="10" @click="collapseAll" />
                  </th>
                  <th
                    v-for="config in Object.values(workCategoryConfigs)"
                    :key="config.label"
                    :class="[config.styleConfig.headerClasses]"
                  >
                    {{ config.label }}
                  </th>
                  <!--actions column-->
                  <th></th>
                </tr>
              </thead>
              <tbody ref="tableBody">
                <EntityTableBody
                  :rows="workCategoryTable"
                  :subrows="workItemTable"
                  :is-field-changed="isWorkCategoryFieldChanged"
                  :is-calculated-field-changed="isCalculatedFieldChanged"
                >
                </EntityTableBody>
                <tr></tr>
                <tr class="subtotal-row">
                  <td colspan="12" class="align-right">Total Custo Directo Materiais</td>
                  <td
                    class="align-right"
                    :class="{
                      'calculated-changed': calculatedChangedFields.has('project.totalDirectCostMaterials'),
                    }"
                  >
                    {{ formatCurrency(project.totalDirectCostMaterials) }}
                  </td>
                  <td />
                </tr>
                <tr class="subtotal-row">
                  <td colspan="12" class="align-right">Total Custo Directo Mão de Obra</td>
                  <td
                    class="align-right"
                    :class="{
                      'calculated-changed': calculatedChangedFields.has('project.totalDirectCostLabor'),
                    }"
                  >
                    {{ formatCurrency(project.totalDirectCostLabor) }}
                  </td>
                  <td />
                </tr>
                <tr class="total-row">
                  <td colspan="12" class="align-right">TOTAL CUSTO DIRETO</td>
                  <td
                    class="align-right"
                    :class="{
                      'calculated-changed': calculatedChangedFields.has('project.totalDirectCost'),
                    }"
                  >
                    {{ formatCurrency(project.totalDirectCost) }}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tab-actions">
        <button
          type="button"
          class="btn"
          :class="{ 'btn-highlight': !apiStatus.isLoading && props.hasUnsavedChanges }"
          :disabled="apiStatus.isLoading || !props.hasUnsavedChanges"
          @click="saveProject"
        >
          <Save :size="18" />
          Guardar Alterações
        </button>
      </div>
    </div>
  </div>

  <Toast v-if="apiStatus.message" :message="apiStatus.message" :type="apiStatus.isSuccess ? 'success' : 'error'" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { LoaderCircle, Minus, Plus, Save } from 'lucide-vue-next';
import { ApiResponseStatus } from '@/types/api-response-status';
import { apiError } from '@/services/api.ts';
import projectApi from '@/services/project-api.ts';
import { ProjectType, ProjectWorkCategoryType, ProjectWorkItemType } from '@/entities/project';
import Toast from '@/components/Toast.vue';
import { QuantityMapCategory, QuantityMapItem } from '@/entities/quantity-map';
import { Configs, EntityTableBodyProps, TableRow } from '@/types/entity-configs';
import EntityTableBody from './EntityTableBody.vue';
import { formatCurrency } from '@/utils/validation.ts';

const project = defineModel<ProjectType>({ required: true });
const props = defineProps<{
  hasUnsavedChanges: boolean;
  changedFields: Set<string>;
  expandedCategoryIds: string[];
}>();

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });

const emit = defineEmits<{
  reload: [];
  saved: [];
  'update:expanded-category-ids': [ids: string[]];
}>();

const workCategories = ref<WorkCategoryRow[]>([]);
const workCategoryConfigs = computed(() => QuantityMapCategory.getConfigs());
const workItemConfigs = computed<Configs<ProjectWorkItemType>>(() => {
  const configs = QuantityMapItem.getConfigs();

  return {
    ...configs,

    isIncluded: {
      ...configs.isIncluded,
      onValueChanged: (row) => {
        recalculateTotals(row, 'isIncluded');
      },
    },

    quantity: {
      ...configs.quantity,
      onValueChanged: (row) => {
        recalculateTotals(row, 'quantity');
      },
    },

    unitPrice: {
      ...configs.unitPrice,
      onValueChanged: (row) => {
        recalculateTotals(row, 'unitPrice');
      },
    },

    laborHours: {
      ...configs.laborHours,
      onValueChanged: (row) => {
        recalculateTotals(row, 'laborHours');
      },
    },

    customHourlyLaborCost: {
      ...configs.customHourlyLaborCost,
      onValueChanged: (row) => {
        recalculateTotals(row, 'customHourlyLaborCost');
      },
    },
  };
});

const isEditing = ref(false);

const workCategoryTable = computed<EntityTableBodyProps<ProjectWorkCategoryType>>(() => ({
  rows: workCategories.value,
  configs: workCategoryConfigs.value,
  handlers: {
    expandCollapse: expandCollapseWorkCategoryRow,
    reorder: () => {},
  },
  rowIsActive: () => true,
  isValid: () => true,
  isEditing: isEditing,
}));

const workItemTable = computed(() => ({
  rows: getWorkItems,
  configs: workItemConfigs.value,
  handlers: {
    reorder: reorderWorkItems,
  },
  rowIsActive: isActive,
  isValid: (workItem: QuantityMapItem) => QuantityMapItem.isValid(workItem, workItemConfigs.value),
  isEditing: isEditing,
}));

/*************************************************************************************************************** LOAD */

onMounted(async () => {
  await getWorkCategories();
});

watch(
  workCategories,
  (rows) => {
    project.value.workCategories = project.value.workCategories?.map(
      (category) => rows.find((row) => row.entity.workCategoryId === category.workCategoryId)?.entity ?? category,
    );
  },
  { deep: true },
);

function isWorkCategoryFieldChanged(row: WorkCategoryRow | WorkItemRow, field: string): boolean {
  if ('workCategoryId' in row.entity) {
    const categoryIndex = project.value.workCategories?.findIndex(
      (category) => category.workCategoryId === row.entity.id,
    );

    return categoryIndex !== undefined && categoryIndex >= 0
      ? props.changedFields.has(`workCategories[${categoryIndex}].${field}`)
      : false;
  }

  const workItem = row.entity as ProjectWorkItemType;
  const parentCategory = project.value.workCategories?.find((category) =>
    category.workItems?.some((item) => item.workItemId === workItem.workItemId),
  );
  const workItemIndex = parentCategory?.workItems?.findIndex((item) => item.workItemId === workItem.workItemId) ?? -1;
  const parentIndex = project.value.workCategories?.findIndex((category) => category === parentCategory) ?? -1;

  return parentIndex >= 0 && workItemIndex >= 0
    ? props.changedFields.has(`workCategories[${parentIndex}].workItems[${workItemIndex}].${field}`)
    : false;
}

async function getWorkCategories() {
  workCategories.value = (project.value.workCategories ?? [])
    .filter((workCategory) => workCategory.isIncluded)
    .map((workCategory) => ({
      entity: {
        ...workCategory,
      },
      _key: workCategory.id ?? nextKey(),
      _isNew: false,
      _isEdited: false,
      _expanded: workCategory.workCategoryId ? props.expandedCategoryIds.includes(workCategory.workCategoryId) : true,
    }));
}

function getWorkItems(workCategory: ProjectWorkCategoryType): WorkItemRow[] {
  return (workCategory.workItems ?? []).map((workItem, index) => ({
    entity: workItem,
    _key: workItem.id ?? `${workCategory.id}-${index}`,
    _isNew: false,
    _isEdited: true,
    _parentId: workCategory.id!,
  }));
}

/******************************************************************************************************** ROW ACTIONS */

interface WorkCategoryRow extends TableRow<ProjectWorkCategoryType> {}
interface WorkItemRow extends TableRow<ProjectWorkItemType> {}

let _keyCounter = 0;
function nextKey(): string {
  return `row-${++_keyCounter}`;
}

function expandCollapseWorkCategoryRow(row: WorkCategoryRow) {
  if (row._isNew || row._isEdited) {
    return;
  }

  row._expanded = !row._expanded;
  row.entity._expanded = row._expanded;
  updateExpandedCategoryIds();
}

function expandAll() {
  workCategories.value.forEach((row) => {
    row._expanded = true;
    row.entity._expanded = true;
  });
  updateExpandedCategoryIds();
}

function collapseAll() {
  workCategories.value.forEach((row) => {
    row._expanded = false;
    row.entity._expanded = false;
  });
  updateExpandedCategoryIds();
}

function updateExpandedCategoryIds() {
  emit(
    'update:expanded-category-ids',
    workCategories.value.flatMap((row) =>
      row._expanded && row.entity.workCategoryId ? [row.entity.workCategoryId] : [],
    ),
  );
}

function isActive(workItem: WorkItemRow) {
  return workItem.entity.isIncluded!;
}

/************************************************************************************************************* REORDER*/

async function reorderWorkItems(rows: WorkItemRow[]): Promise<void> {
  rows.forEach((row, index) => {
    row.entity.index = index + 1;
  });
}

/*************************************************************************************************************** SAVE */

async function saveProject() {
  if (!project.value.id) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    await projectApi.updateProject(project.value.id, project.value);

    emit('saved');
    emit('reload');

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false, message: 'Projeto guardado com sucesso.' };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível guardar o projeto.');
  }
}

/************************************************************************************************* RECALCULATE TOTALS */

const calculatedChangedFields = ref<Set<string>>(new Set());

function recalculateTotals(changedRow?: WorkItemRow, changedField?: keyof ProjectWorkItemType): void {
  let totalDirectCost = 0;

  let changedCategoryIndex = -1;
  let changedWorkItemIndex = -1;

  if (changedRow) {
    for (let categoryIndex = 0; categoryIndex < workCategories.value.length; categoryIndex++) {
      const workItems = workCategories.value[categoryIndex].entity.workItems ?? [];

      const workItemIndex = workItems.findIndex((workItem) => workItem.workItemId === changedRow.entity.workItemId);

      if (workItemIndex >= 0) {
        changedCategoryIndex = categoryIndex;
        changedWorkItemIndex = workItemIndex;
        break;
      }
    }
  }

  workCategories.value.forEach((categoryRow) => {
    const category = categoryRow.entity;
    let categoryTotalMaterials = 0;
    let categoryTotalLabor = 0;
    let categoryTotal = 0;

    category.workItems?.forEach((workItem) => {
      const totalMaterial =
        workItem.isIncluded && workItem.quantity != null && workItem.unitPrice != null
          ? workItem.quantity * workItem.unitPrice
          : 0;

      const totalLabor =
        workItem.isIncluded && workItem.laborHours != null && workItem.customHourlyLaborCost != null
          ? workItem.laborHours * workItem.customHourlyLaborCost
          : 0;

      const total = totalMaterial + totalLabor;

      workItem.totalMaterials = totalMaterial;
      workItem.totalLabor = totalLabor;
      workItem.total = total;

      categoryTotalMaterials += totalMaterial;
      categoryTotalLabor += totalLabor;
      categoryTotal += total;
    });

    category.directCostMaterials = categoryTotalMaterials;
    category.directCostLabor = categoryTotalLabor;
    category.directCost = categoryTotal;
    totalDirectCost += categoryTotal;
  });

  project.value.totalDirectCost = totalDirectCost;

  if (changedCategoryIndex >= 0 && changedWorkItemIndex >= 0) {
    if (changedField === 'quantity' || changedField === 'unitPrice') {
      calculatedChangedFields.value.add(`workCategories[${changedCategoryIndex}].totalMaterials`);
      calculatedChangedFields.value.add(
        `workCategories[${changedCategoryIndex}].workItems[${changedWorkItemIndex}].totalMaterials`,
      );
      calculatedChangedFields.value.add(
        `workCategories[${changedCategoryIndex}].workItems[${changedWorkItemIndex}].total`,
      );
    }

    if (changedField === 'laborHours' || changedField === 'customHourlyLaborCost') {
      calculatedChangedFields.value.add(`workCategories[${changedCategoryIndex}].totalLabor`);
      calculatedChangedFields.value.add(
        `workCategories[${changedCategoryIndex}].workItems[${changedWorkItemIndex}].totalLabor`,
      );
      calculatedChangedFields.value.add(
        `workCategories[${changedCategoryIndex}].workItems[${changedWorkItemIndex}].total`,
      );
    }

    calculatedChangedFields.value.add(`workCategories[${changedCategoryIndex}].total`);
  }

  calculatedChangedFields.value.add('project.totalDirectCost');
  calculatedChangedFields.value = new Set(calculatedChangedFields.value);
}

function isCalculatedFieldChanged(row: WorkCategoryRow | WorkItemRow, field: string): boolean {
  const categoryIndex = workCategories.value.findIndex((categoryRow) => categoryRow.entity.id === row.entity.id);

  if (categoryIndex >= 0) {
    return calculatedChangedFields.value.has(`workCategories[${categoryIndex}].${field}`);
  }

  const workItem = row.entity as ProjectWorkItemType;

  for (let categoryIndex = 0; categoryIndex < workCategories.value.length; categoryIndex++) {
    const workItems = workCategories.value[categoryIndex].entity.workItems ?? [];

    const workItemIndex = workItems.findIndex((item) => item.workItemId === workItem.workItemId);

    if (workItemIndex >= 0) {
      return calculatedChangedFields.value.has(`workCategories[${categoryIndex}].workItems[${workItemIndex}].${field}`);
    }
  }

  return false;
}
</script>

<style lang="scss">
.table-container {
  width: 100%;
  height: 100%;
  min-height: 0;

  border: 1px solid var(--color-border);
  border-radius: 6px;

  background: var(--color-background);

  overflow: auto;
  display: flex;
  flex-direction: column;
}
</style>
