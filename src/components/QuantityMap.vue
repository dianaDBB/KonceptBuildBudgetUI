<template>
  <div>
    <div v-if="apiStatus.isLoading" class="loading-overlay">
      <div>
        <LoaderCircle :size="18" class="spinner" />
        A carregar projeto...
      </div>
    </div>

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
            <th v-for="config in Object.values(workCategoryConfigs)" :key="config.label">
              <div class="column-heading">
                {{ config.label }}
              </div>
            </th>
            <!--actions column-->
            <th></th>
          </tr>
        </thead>
        <tbody ref="tableBody">
          <EntityTableBody :rows="workCategoryTable" :subrows="workItemTable"> </EntityTableBody>
        </tbody>
      </table>
    </div>

    <div class="form-actions">
      <button type="button" class="btn" :disabled="apiStatus.isLoading" @click="saveProject">
        <Save :size="18" />
        Guardar Alterações
      </button>
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

const project = defineModel<ProjectType>({ required: true });

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });

const emit = defineEmits<{
  reload: [];
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
        _workItemRows: getWorkItems(workCategory),
      },
      _key: workCategory.id ?? nextKey(),
      _isNew: false,
      _isEdited: false,
      _expanded: true,
    }));
}

function getWorkItems(workCategory: ProjectWorkCategoryType): WorkItemRow[] {
  if (!(workCategory as ProjectWorkCategoryType & { _workItemRows?: WorkItemRow[] })._workItemRows) {
    (workCategory as ProjectWorkCategoryType & { _workItemRows?: WorkItemRow[] })._workItemRows = (
      workCategory.workItems ?? []
    ).map((workItem, index) => {
      return {
        entity: workItem,
        _key: workItem.id ?? `${workCategory.id}-${index}`,
        _isNew: false,
        _isEdited: true,
        _parentId: workCategory.id!,
      };
    });
  }

  return (workCategory as ProjectWorkCategoryType & { _workItemRows: WorkItemRow[] })._workItemRows;
}

/******************************************************************************************************** ROW ACTIONS */

interface WorkCategoryRow extends TableRow<ProjectWorkCategoryType & { _workItemRows: WorkItemRow[] }> {}
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

    emit('reload');

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false, message: 'Projeto guardado com sucesso.' };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível guardar o projeto.');
  }
}
</script>

<style lang="scss"></style>
