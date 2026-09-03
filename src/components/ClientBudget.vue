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
                  <th
                    v-for="config in Object.values(clientBudgetCategoryConfigs)"
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
                <tr>
                  <td colspan="6" />
                </tr>
                <tr class="subtotal-row">
                  <td colspan="5" class="align-right">SUBTOTAL (sem IVA)</td>
                  <td class="align-right">{{ formatCurrency(project.totalWithoutTax) }}</td>
                </tr>
                <tr class="subtotal-row">
                  <td colspan="5" class="align-right">IVA (23%)</td>
                  <td class="align-right">{{ formatCurrency(project.totalTax) }}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="5" class="align-right">TOTAL DA EMPREITADA (c/ IVA)</td>
                  <td class="align-right">{{ formatCurrency(project.totalWithTax) }}</td>
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
      </div>
    </div>
  </div>

  <Toast v-if="apiStatus.message" :message="apiStatus.message" :type="apiStatus.isSuccess ? 'success' : 'error'" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { LoaderCircle, Sheet } from 'lucide-vue-next';
import { ApiResponseStatus } from '@/types/api-response-status';
import { apiError } from '@/services/api.ts';
import { ProjectType, ProjectWorkCategoryType, ProjectWorkItemType } from '@/entities/project';
import Toast from '@/components/Toast.vue';
import { QuantityMapItem } from '@/entities/quantity-map';
import { EntityTableBodyProps, TableRow } from '@/types/entity-configs';
import EntityTableBody from './EntityTableBody.vue';
import { ClientBudgetCategory, ClientBudgetItem } from '@/entities/client-budget.ts';
import { formatCurrency } from '@/utils/validation.ts';
import projectApi from '@/services/project-api.ts';

const project = defineModel<ProjectType>({ required: true });
const props = defineProps<{
  expandedCategoryIds: string[];
}>();

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });

const emit = defineEmits<{
  reload: [];
  'update:expanded-category-ids': [ids: string[]];
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
      },
      _key: workCategory.id ?? nextKey(),
      _isNew: false,
      _isEdited: false,
      _expanded: workCategory.workCategoryId ? props.expandedCategoryIds.includes(workCategory.workCategoryId) : true,
    }));
}

function getWorkItems(workCategory: ProjectWorkCategoryType): WorkItemRow[] {
  return (workCategory.workItems ?? [])
    .filter((workItem) => workItem.isIncluded)
    .map((workItem, index) => ({
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

/************************************************************************************************************* EXPORT */

async function exportToExcel() {
  if (!project.value.id) return;

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    const blob = await projectApi.exportToExcel(project.value.id);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Orçamento - ${project.value.client}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false, message: 'Excel gerado com sucesso.' };
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
