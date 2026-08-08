<template>
  <div class="main-section">
    <div class="section-header">
      <span><FileInput :size="24" /></span>
      <h3>Especialidades</h3>

      <div class="page-nav">
        <RouterLink to="/" class="link"> Página Inicial </RouterLink>
      </div>
    </div>

    <div class="section">
      <div v-if="apiStatus.isLoading" class="loading-overlay">
        <div>
          <LoaderCircle :size="18" class="spinner" />
          A carregar especialidades...
        </div>
      </div>
      <div class="section-body">
        <div class="table">
          <table>
            <colgroup>
              <col
                v-for="config in Object.values(workCategoryConfigs)"
                :key="config.label"
                :style="config.styleConfig.columnStyle"
              />
              <col style="width: 130px" />
              <!--actions column-->
            </colgroup>
            <thead>
              <tr>
                <th v-for="config in Object.values(workCategoryConfigs)" :key="config.label">
                  <div class="column-heading">
                    {{ config.label }}
                  </div>
                </th>
                <th></th>
                <!--actions column-->
              </tr>
            </thead>
            <EntityTableBody :rows="workCategoryTable" :subrows="workItemTable">
              <template #row-actions="{ row, isSubrow }">
                <template v-if="!isSubrow">
                  <button
                    title="Eliminar fatura"
                    :disabled="workCategoryTable.isEditing.value"
                    @click="askDeleteWorkCategory(row)"
                  >
                    <Trash2 :size="16" />
                  </button>
                  <button
                    title="Editar fatura"
                    :disabled="workCategoryTable.isEditing.value"
                    @click="startEditingWorkCategory(row)"
                  >
                    <Pencil :size="16" />
                  </button>
                  <button
                    title="Adicionar sub especialidade"
                    :disabled="workItemTable.isEditing.value"
                    @click="addWorkItem(row)"
                  >
                    <Plus :size="16" />
                  </button>
                </template>
                <template v-else>
                  <button
                    title="Eliminar sub especialidade"
                    :disabled="workItemTable.isEditing.value"
                    @click="askDeleteWorkItem(row)"
                  >
                    <Trash2 :size="16" />
                  </button>
                  <button
                    title="Editar sub especialidade"
                    :disabled="workItemTable.isEditing.value"
                    @click="startEditingWorkItem(row)"
                  >
                    <Pencil :size="16" />
                  </button>
                </template>
              </template>
            </EntityTableBody>
          </table>
        </div>

        <div class="actions">
          <button
            class="btn"
            :disabled="workCategoryTable.isEditing.value || apiStatus.isLoading"
            @click="addWorkCategory"
          >
            <Plus :size="18" /> Adicionar Especialidade
          </button>
        </div>

        <Toast
          v-if="apiStatus.message"
          :message="apiStatus.message"
          :type="apiStatus.isSuccess ? 'success' : 'error'"
        />
      </div>
    </div>
  </div>

  <!-- delete dialog-->
  <ConfirmDialog
    v-model="showDeleteWorkCategoryDialog"
    title="Eliminar fatura / nota crédito"
    :message="[
      `${workCategoryToDelete?.entity.description}`,
      'Tem a certeza que quer eliminar definitivamente esta especialidade?',
    ]"
    confirm-text="Apagar"
    cancel-text="Cancelar"
    @confirm="confirmDeleteWorkCategory"
  />

  <!-- delete dialog subrow-->
  <ConfirmDialog
    v-model="showDeleteWorkItemDialog"
    title="Eliminar pagamento"
    :message="[
      `${workItemToDelete?.entity.description}`,
      'Tem a certeza que quer eliminar definitivamente esta sub especialidade?',
    ]"
    confirm-text="Apagar"
    cancel-text="Cancelar"
    @confirm="confirmDeleteWorkItem"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { ApiResponseStatus } from '@/types/api-response-status';
import { FileInput, Plus, LoaderCircle, Trash2, Pencil } from 'lucide-vue-next';
import Toast from '@/components/Toast.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import { EntityTableBodyProps, TableRow } from '@/types/entity-configs.ts';
import { WorkCategory, WorkCategoryType } from '@/entities/work-category.ts';
import { WorkItem, WorkItemType } from '@/entities/work-item.ts';
import { apiError } from '@/services/api.ts';
import workCategoryApi from '@/services/work-category-api.ts';
import EntityTableBody from './EntityTableBody.vue';

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });
const tableBody = ref<HTMLTableSectionElement | null>(null);

const workCategories = ref<WorkCategoryRow[]>([]);
const workCategoryConfigs = computed(() => WorkCategory.getConfigs());
const workItemConfigs = computed(() => WorkItem.getConfigs());

const isEditing = ref(false);

const workCategoryTable = computed<EntityTableBodyProps<WorkCategoryType>>(() => ({
  rows: workCategories.value,
  configs: workCategoryConfigs.value,
  handlers: {
    edit: startEditingWorkCategory,
    delete: askDeleteWorkCategory,
    save: saveWorkCategory,
    discard: discardWorkCategoryRow,
    toggle: toggleWorkCategoryRow,
  },
  rowIsActive: () => true,
  isValid: (workCategory) => WorkCategory.isValid(workCategory, workCategoryConfigs.value),
  isEditing: isEditing,
}));

const workItemTable = computed(() => ({
  rows: getWorkItems,
  configs: workItemConfigs.value,
  handlers: {
    edit: startEditingWorkItem,
    save: saveWorkItem,
    delete: () => {},
    discard: discardWorkItemRow,
  },
  rowIsActive: () => true,
  isValid: (workItem: WorkItem) => WorkItem.isValid(workItem, workItemConfigs.value),
  isEditing: isEditing,
}));

/*************************************************************************************************************** LOAD */

onMounted(async () => {
  await getWorkCategories();
});

async function getWorkCategories() {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    const gotWorkCategies = await workCategoryApi.getWorkCategories();

    workCategories.value = gotWorkCategies.map((workCategory) => ({
      entity: {
        ...workCategory,
        _workItemRows: getWorkItems(workCategory),
      },
      _key: workCategory.id ?? nextKey(),
      _isNew: false,
      _isEdited: false,
      _expanded: false,
    }));

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível carregar as especialidades.');
  }
}

function getWorkItems(workCategory: WorkCategoryType): WorkItemRow[] {
  if (!(workCategory as WorkCategoryType & { _workItemRows?: WorkItemRow[] })._workItemRows) {
    (workCategory as WorkCategoryType & { _workItemRows?: WorkItemRow[] })._workItemRows = (
      workCategory.workItems ?? []
    ).map((workItem, index) => {
      return {
        entity: workItem,
        _key: workItem.id ?? `${workCategory.id}-${index}`,
        _isNew: false,
        _isEdited: false,
        _parentId: workCategory.id!,
      };
    });
  }

  return (workCategory as WorkCategoryType & { _workItemRows: WorkItemRow[] })._workItemRows;
}

/******************************************************************************************** ROW ACTIONS - MAIN ROWS */

interface WorkCategoryRow extends TableRow<WorkCategoryType & { _workItemRows: WorkItemRow[] }> {}

let _keyCounter = 0;
function nextKey(): string {
  return `row-${++_keyCounter}`;
}

function discardWorkCategoryRow(row: WorkCategoryRow) {
  if (row._isNew) {
    workCategories.value = workCategories.value.filter((w) => w._key !== row._key);
  } else {
    row.entity = row._original!;
    row._isNew = false;
    row._isEdited = false;
  }

  isEditing.value = false;
}

function toggleWorkCategoryRow(row: WorkCategoryRow) {
  if (row._isNew || row._isEdited) {
    return;
  }

  row._expanded = !row._expanded;
}

/********************************************************************************************* ROW ACTIONS - SUB ROWS */

interface WorkItemRow extends TableRow<WorkItemType> {}

let _keyCounterSubrow = 0;
function nextKeySubRow(): string {
  return `row-${++_keyCounterSubrow}`;
}

function discardWorkItemRow(row: WorkItemRow) {
  if (row._isNew) {
    const workCategory = workCategories.value.find((workCategory) => workCategory.entity.id === row._parentId);

    if (!workCategory) {
      return;
    }

    workCategory.entity.workItems = (workCategory.entity.workItems ?? []).filter((workItem) => workItem !== row.entity);

    delete (workCategory.entity as WorkCategoryType & { _workItemRows?: WorkItemType[] })._workItemRows;
  } else {
    row.entity = row._original!;
    row._isNew = false;
    row._isEdited = false;
  }

  isEditing.value = false;
}

/*************************************************************************************************************** EDIT */

function startEditingWorkCategory(row: WorkCategoryRow) {
  isEditing.value = true;

  row._isEdited = true;
  row._original = JSON.parse(JSON.stringify(row.entity));
}

function startEditingWorkItem(row: WorkItemRow) {
  isEditing.value = true;

  row._isEdited = true;
  row._original = JSON.parse(JSON.stringify(row.entity));
}

/**************************************************************************************************************** ADD */

async function addWorkCategory(): Promise<void> {
  isEditing.value = true;

  workCategories.value.push({
    entity: {
      _workItemRows: [],
    },
    _key: nextKey(),
    _isNew: true,
    _isEdited: false,
  });

  await nextTick();

  const lastRow = tableBody.value?.querySelector('tr:last-child');
  lastRow?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });

  (lastRow?.querySelector('input') as HTMLInputElement)?.focus();
}

/********************************************************************************************************* ADD SUBROW */

async function addWorkItem(row: WorkCategoryRow): Promise<void> {
  isEditing.value = true;

  const entity: WorkCategoryType = {};

  row.entity.workItems ??= [];
  row.entity.workItems.push(entity);

  const workItems = getWorkItems(row.entity);
  workItems.push({
    entity,
    _key: nextKeySubRow(),
    _parentId: row.entity.id!,
    _isNew: true,
    _isEdited: false,
  });

  row._expanded = true;

  await nextTick();
}

/*************************************************************************************************************** SAVE */

async function saveWorkCategory(row: WorkCategoryRow): Promise<void> {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    if (row._isNew) {
      await workCategoryApi.createWorkCategory(row.entity);
    } else if (row._isEdited) {
      await workCategoryApi.updateWorkCategory(row.entity.id!, row.entity);
    }

    await getWorkCategories();
    isEditing.value = false;

    apiStatus.value = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      message: 'Alterações guardadas com sucesso.',
    };
  } catch (error: unknown) {
    await getWorkCategories();
    isEditing.value = false;
    apiStatus.value = apiError(error, 'Não foi possível guardar as alterações.');
  }
}

async function saveWorkItem(row: WorkItemRow): Promise<void> {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    const workCategory = workCategories.value.find((workCategory) => workCategory.entity.id === row._parentId);

    if (!workCategory) {
      apiStatus.value = apiError(null, 'Não foi possível guardar as alterações.');
      return;
    }

    if (row._isNew) {
      await workCategoryApi.createWorkItem(workCategory.entity.id!, row.entity);
    } else {
      await workCategoryApi.updateWorkItem(workCategory.entity.id!, row.entity.id!, row.entity);
    }

    await getWorkCategories();
    isEditing.value = false;

    apiStatus.value = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      message: 'Alterações guardadas com sucesso.',
    };
  } catch (error) {
    await getWorkCategories();
    isEditing.value = false;
    apiStatus.value = apiError(error, 'Não foi possível guardar as alterações.');
  }
}

/************************************************************************************************************* DELETE */

const showDeleteWorkCategoryDialog = ref(false);
const workCategoryToDelete = ref<WorkCategoryRow | null>(null);

function askDeleteWorkCategory(row: WorkCategoryRow) {
  workCategoryToDelete.value = row;
  showDeleteWorkCategoryDialog.value = true;
}

async function confirmDeleteWorkCategory(): Promise<void> {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    if (!workCategoryToDelete.value?.entity.id) {
      return;
    }

    await workCategoryApi.deleteWorkCategory(workCategoryToDelete.value.entity.id);
    await getWorkCategories();

    apiStatus.value = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      message: 'Alterações guardadas com sucesso.',
    };

    showDeleteWorkCategoryDialog.value = false;
    workCategoryToDelete.value = null;
  } catch (error: unknown) {
    await getWorkCategories();
    apiStatus.value = apiError(error, 'Não foi possível guardar as alterações.');
  }
}

const showDeleteWorkItemDialog = ref(false);
const workItemToDelete = ref<WorkItemRow | null>(null);

function askDeleteWorkItem(row: WorkItemRow) {
  workItemToDelete.value = row;
  showDeleteWorkItemDialog.value = true;
}

async function confirmDeleteWorkItem(): Promise<void> {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    if (!workItemToDelete.value?.entity.id) {
      return;
    }

    await workCategoryApi.deleteWorkItem(workItemToDelete.value._parentId!, workItemToDelete.value.entity.id);
    await getWorkCategories();

    apiStatus.value = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      message: 'Alterações guardadas com sucesso.',
    };

    showDeleteWorkItemDialog.value = false;
    workItemToDelete.value = null;
  } catch (error: unknown) {
    await getWorkCategories();
    apiStatus.value = apiError(error, 'Não foi possível guardar as alterações.');
  }
}
</script>
<style lang="scss"></style>
