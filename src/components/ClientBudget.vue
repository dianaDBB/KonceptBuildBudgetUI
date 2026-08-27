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
                <!--expand column-->
                <col style="width: 20px" />
                <col
                  v-for="config in Object.values(clientBudgetCategoryConfigs)"
                  :key="config.label"
                  :style="config.styleConfig.columnStyle"
                />
              </colgroup>
              <thead>
                <tr>
                  <!--expand column-->
                  <th></th>
                  <th v-for="config in Object.values(clientBudgetCategoryConfigs)" :key="config.label">
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
                <tr>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
                <tr class="subtotal-row">
                  <td />
                  <td />
                  <td class="number-column">SUBTOTAL (sem IVA)</td>
                  <td class="number-column">{{ formatCurrency(project.totalWithoutTax) }}</td>
                </tr>
                <tr class="subtotal-row">
                  <td />
                  <td />
                  <td class="number-column">IVA (23%)</td>
                  <td class="number-column">{{ formatCurrency(project.totalTax) }}</td>
                </tr>
                <tr class="total-row">
                  <td />
                  <td />
                  <td class="number-column">TOTAL DA EMPREITADA (c/ IVA)</td>
                  <td class="number-column">{{ formatCurrency(project.totalWithTax) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tab-actions">
        <button type="button" class="btn" :disabled="apiStatus.isLoading" @click="exportToExcel">
          <Sheet :size="18" />
          Exportar para Excel
        </button>

        <button type="button" class="btn" :disabled="apiStatus.isLoading" @click="exportToPdf">
          <FileText :size="18" />
          Exportar para PDF
        </button>
      </div>
    </div>
  </div>

  <Toast v-if="apiStatus.message" :message="apiStatus.message" :type="apiStatus.isSuccess ? 'success' : 'error'" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { FileText, LoaderCircle, Sheet } from 'lucide-vue-next';
import { ApiResponseStatus } from '@/types/api-response-status';
import { apiError } from '@/services/api.ts';
import { ProjectType, ProjectWorkCategoryType, ProjectWorkItemType } from '@/entities/project';
import Toast from '@/components/Toast.vue';
import { QuantityMapItem } from '@/entities/quantity-map';
import { EntityTableBodyProps, TableRow } from '@/types/entity-configs';
import EntityTableBody from './EntityTableBody.vue';
import { ClientBudgetCategory, ClientBudgetItem } from '@/entities/client-budget.ts';
import { formatCurrency } from '@/utils/validation.ts';

const project = defineModel<ProjectType>({ required: true });

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });

const emit = defineEmits<{
  reload: [];
}>();

const workCategories = ref<WorkCategoryRow[]>([]);
const clientBudgetCategoryConfigs = computed(() => ClientBudgetCategory.getConfigs());
const clientBudgetItemConfigs = computed(() => ClientBudgetItem.getConfigs());

const isEditing = ref(false);

const workCategoryTable = computed<EntityTableBodyProps<ProjectWorkCategoryType>>(() => ({
  rows: workCategories.value,
  configs: clientBudgetCategoryConfigs.value,
  handlers: {
    expandCollapse: expandCollapseWorkCategoryRow,
  },
  rowIsActive: () => true,
  isValid: () => true,
  isEditing: isEditing,
}));

const workItemTable = computed(() => ({
  rows: getWorkItems,
  configs: clientBudgetItemConfigs.value,
  handlers: {},
  rowIsActive: isActive,
  isValid: (workItem: QuantityMapItem) => QuantityMapItem.isValid(workItem, clientBudgetItemConfigs.value),
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

/************************************************************************************************************* EXPORT */

async function exportToExcel() {
  if (!project.value.id) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    // TODO : export to Excel

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false, message: 'Excel gerado com sucesso.' };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível gerar o ficheiro.');
  }
}

async function exportToPdf() {
  if (!project.value.id) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    // TODO : export to Excel

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false, message: 'PDF gerado com sucesso.' };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível gerar o ficheiro.');
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
