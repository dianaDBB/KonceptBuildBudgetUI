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
                <col style="width: 20px" />
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
                  <th></th>
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
                <EntityTableBody :rows="workCategoryTable" :subrows="workItemTable"> </EntityTableBody>
                <tr></tr>
                <tr class="total-row">
                  <td colspan="8" class="align-right">TOTAL CUSTO DIRETO (BRUTO)</td>
                  <td class="align-right">{{ formatCurrency(project.totalDirectCost) }}</td>
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
import { computed, onMounted, ref } from 'vue';
import { LoaderCircle, Save } from 'lucide-vue-next';
import { ApiResponseStatus } from '@/types/api-response-status';
import { apiError } from '@/services/api.ts';
import projectApi from '@/services/project-api.ts';
import { ProjectType, ProjectWorkCategoryType, ProjectWorkItemType } from '@/entities/project';
import Toast from '@/components/Toast.vue';
import { QuantityMapCategory, QuantityMapItem } from '@/entities/quantity-map';
import { EntityTableBodyProps, TableRow } from '@/types/entity-configs';
import EntityTableBody from './EntityTableBody.vue';
import { formatCurrency } from '@/utils/validation.ts';

const project = defineModel<ProjectType>({ required: true });
const props = defineProps<{ hasUnsavedChanges: boolean }>();

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });

const emit = defineEmits<{
  reload: [];
  saved: [];
}>();

const workCategories = ref<WorkCategoryRow[]>([]);
const workCategoryConfigs = computed(() => QuantityMapCategory.getConfigs());
const workItemConfigs = computed(() => QuantityMapItem.getConfigs());

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

async function getWorkCategories() {
  workCategories.value = project.value
    .workCategories!.filter((workCategory) => workCategory.isIncluded)
    .map((workCategory) => ({
      entity: {
        ...workCategory,
      },
      _key: workCategory.id ?? nextKey(),
      _isNew: false,
      _isEdited: false,
      _expanded: true,
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
