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
        <div class="forms-container">
          <div class="form-section">
            <h3>Dados da Obra</h3>

            <div class="form-grid">
              <div class="form-group" :class="{ changed: isFieldChanged('description') }">
                <label>{{ projectConfigs.description.label }}</label>
                <TextInput
                  :value="project.description"
                  :is-invalid="!project.description"
                  :is-disabled="false"
                  @update:value="project.description = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('address') }">
                <label>{{ projectConfigs.address.label }}</label>
                <TextInput
                  :value="project.address"
                  :is-invalid="!project.address"
                  :is-disabled="false"
                  @update:value="project.address = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('client') }">
                <label>{{ projectConfigs.client.label }}</label>
                <TextInput
                  :value="project.client"
                  :is-invalid="!project.client"
                  :is-disabled="false"
                  @update:value="project.client = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('contact') }">
                <label>{{ projectConfigs.contact.label }}</label>
                <TextInput
                  :value="project.contact"
                  :is-invalid="false"
                  :is-disabled="false"
                  @update:value="project.contact = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('landArea') }">
                <label>{{ projectConfigs.landArea.label }}</label>
                <NumberInput
                  :entity="projectEntity"
                  :value="project.landArea"
                  field-key="landArea"
                  :is-invalid="!project.landArea"
                  :is-disabled="false"
                  @update:value="project.landArea = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('implantationArea') }">
                <label>{{ projectConfigs.implantationArea.label }}</label>
                <NumberInput
                  :entity="projectEntity"
                  :value="project.implantationArea"
                  field-key="implantationArea"
                  :is-invalid="!project.implantationArea"
                  :is-disabled="false"
                  @update:value="project.implantationArea = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('grossConstructionArea') }">
                <label>{{ projectConfigs.grossConstructionArea.label }}</label>
                <NumberInput
                  :entity="projectEntity"
                  :value="project.grossConstructionArea"
                  field-key="grossConstructionArea"
                  :is-invalid="!project.grossConstructionArea"
                  :is-disabled="false"
                  @update:value="project.grossConstructionArea = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('floorsCount') }">
                <label>{{ projectConfigs.floorsCount.label }}</label>
                <IntInput
                  :entity="projectEntity"
                  :value="project.floorsCount"
                  field-key="floorsCount"
                  :is-invalid="!project.floorsCount"
                  :is-disabled="false"
                  @update:value="project.floorsCount = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('ceilingHeight') }">
                <label>{{ projectConfigs.ceilingHeight.label }}</label>
                <NumberInput
                  :entity="projectEntity"
                  :value="project.ceilingHeight"
                  field-key="ceilingHeight"
                  :is-invalid="!project.ceilingHeight"
                  :is-disabled="false"
                  @update:value="project.ceilingHeight = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('maxFacadeHeight') }">
                <label>{{ projectConfigs.maxFacadeHeight.label }}</label>
                <NumberInput
                  :entity="projectEntity"
                  :value="project.maxFacadeHeight"
                  field-key="maxFacadeHeight"
                  :is-invalid="!project.maxFacadeHeight"
                  :is-disabled="false"
                  @update:value="project.maxFacadeHeight = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('roomsCount') }">
                <label>{{ projectConfigs.roomsCount.label }}</label>
                <IntInput
                  :entity="projectEntity"
                  :value="project.roomsCount"
                  field-key="roomsCount"
                  :is-invalid="!project.roomsCount"
                  :is-disabled="false"
                  @update:value="project.roomsCount = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('wcCount') }">
                <label>{{ projectConfigs.wcCount.label }}</label>
                <IntInput
                  :entity="projectEntity"
                  :value="project.wcCount"
                  field-key="wcCount"
                  :is-invalid="!project.wcCount"
                  :is-disabled="false"
                  @update:value="project.wcCount = $event"
                />
              </div>

              <div class="form-group" :class="{ changed: isFieldChanged('isActive') }">
                <label>{{ projectConfigs.isActive.label }}</label>
                <CheckBox
                  :value="project.isActive"
                  :is-invalid="false"
                  :is-disabled="false"
                  @update:value="project.isActive = $event"
                />
              </div>
            </div>
          </div>

          <section class="form-section work-categories-section">
            <h3>Desagregação por Especialidades</h3>

            <div class="table">
              <table>
                <colgroup>
                  <!--reorder column-->
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
                    <th
                      v-for="config in Object.values(workCategoryConfigs)"
                      :key="config.label"
                      :class="[config.styleConfig.headerClasses]"
                    >
                      {{ config.label }}
                    </th>
                  </tr>
                </thead>
                <tbody ref="tableBody">
                  <tr class="total-row">
                    <td />
                    <td />
                    <td />
                    <td />
                    <td class="align-right">TOTAL</td>
                    <td class="align-right">{{ formatCurrency(project.totalDirectCost) }}</td>
                    <td class="align-right">{{ formatCurrency(project.totalWithoutTax) }}</td>
                  </tr>
                  <EntityTableBody :rows="workCategoryTable" :is-field-changed="isWorkCategoryFieldChanged">
                  </EntityTableBody>
                </tbody>
              </table>
            </div>
          </section>

          <section class="form-section financial-summary-section">
            <h3>Resumo Financeiro</h3>

            <div class="table">
              <table>
                <colgroup>
                  <col style="width: 140px" />
                  <col style="width: 80px" />
                  <col style="width: 65px" />
                </colgroup>
                <thead>
                  <tr>
                    <th class="align-left">Rubrica</th>
                    <th class="align-right">Valor (€)</th>
                    <th class="align-right">%</th>
                  </tr>
                </thead>
                <tbody ref="tableBody">
                  <tr>
                    <td class="align-left">Custo Direto das Especialidades</td>
                    <td class="align-right">{{ formatCurrency(project.totalDirectCost) }}</td>
                    <td class="align-right">{{ formatPercentage(project.totalDirectCostPercentage) }}</td>
                  </tr>
                  <tr>
                    <td class="align-left">Custos Indiretos</td>
                    <td class="align-right">{{ formatCurrency(project.totalIndirectCost) }}</td>
                    <td class="align-right">{{ formatPercentage(project.totalIndirectCostPercentage) }}</td>
                  </tr>
                  <tr>
                    <td class="align-left">Margem de Lucro</td>
                    <td class="align-right">{{ formatCurrency(project.totalMarginProfit) }}</td>
                    <td class="align-right">{{ formatPercentage(project.totalMarginProfitPercentage) }}</td>
                  </tr>
                  <tr class="subtotal-row">
                    <td class="align-left">SUBTOTAL (S/ IVA)</td>
                    <td class="align-right">{{ formatCurrency(project.totalWithoutTax) }}</td>
                    <td class="align-right">{{ formatPercentage(project.totalWithoutTaxPercentage) }}</td>
                  </tr>
                  <tr>
                    <td class="align-left">IVA</td>
                    <td class="align-right">{{ formatCurrency(project.totalTax) }}</td>
                    <td class="align-right">{{ formatPercentage(project.tax) }}</td>
                  </tr>
                  <tr class="total-row">
                    <td class="align-left">TOTAL EMPREITADA (c/ IVA)</td>
                    <td colspan="2" class="align-right">{{ formatCurrency(project.totalWithTax) }}</td>
                  </tr>
                  <tr>
                    <td class="align-left">Custo por m² (s/ IVA)</td>
                    <td colspan="2" class="align-right">{{ formatCurrency(project.costPerSquareWithoutTax) }}</td>
                  </tr>
                  <tr>
                    <td class="align-left">Custo por m² (c/ IVA)</td>
                    <td colspan="2" class="align-right">{{ formatCurrency(project.costPerSquareWithTax) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div class="form-column">
            <section class="form-section">
              <h3>Taxa IVA</h3>

              <div class="form-grid">
                <div class="form-group" :class="{ changed: isFieldChanged('tax') }">
                  <label>IVA (%)</label>
                  <PercentageInput
                    :value="project.tax"
                    :is-invalid="!project.tax"
                    :is-disabled="false"
                    @update:value="project.tax = $event"
                  />
                </div>
              </div>
            </section>

            <section class="form-section">
              <h3>Custos Indiretos</h3>

              <div class="table">
                <table>
                  <colgroup>
                    <!--reorder column-->
                    <col style="width: 20px" />
                    <col
                      v-for="config in Object.values(indirectCostsConfigs)"
                      :key="config.label"
                      :style="config.styleConfig.columnStyle"
                    />
                  </colgroup>
                  <thead>
                    <tr>
                      <!--reorder column-->
                      <th></th>
                      <th
                        v-for="config in Object.values(indirectCostsConfigs)"
                        :key="config.label"
                        :class="[config.styleConfig.headerClasses]"
                      >
                        {{ config.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody ref="tableBody">
                    <EntityTableBody :rows="indirectCostsTable" :is-field-changed="isIndirectCostFieldChanged">
                    </EntityTableBody>
                    <tr class="total-row">
                      <td />
                      <td />
                      <td />
                      <td class="align-right">TOTAL</td>
                      <td class="align-right">{{ formatCurrency(project.totalIndirectCost) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div class="tab-actions">
        <button type="button" class="btn btn-danger" @click="askDelete">
          <Trash2 :size="18" />
          Apagar Projeto
        </button>

        <button type="button" class="btn" :disabled="apiStatus.isLoading" @click="getNewWorkCategoriesAndItems">
          <RefreshCcw :size="18" />
          Actualizar Especialidades
        </button>

        <button type="button" class="btn" :disabled="apiStatus.isLoading" @click="getNewIndirectCosts">
          <RefreshCcw :size="18" />
          Actualizar Custos Diretos
        </button>

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

  <!-- delete dialog-->
  <ConfirmDialog
    v-model="showDeleteDialog"
    title="Eliminar projeto"
    :message="[
      `${project.description} • ${project.client}`,
      'Tem a certeza que quer eliminar definitivamente este projeto?',
    ]"
    confirm-text="Apagar"
    cancel-text="Cancelar"
    @confirm="confirmDelete"
  />

  <NewWorkCategoriesDialog
    v-model="showNewWorkCategoriesDialog"
    :categories="newWorkCategories"
    @confirm="addSelectedWorkCategories"
  />

  <NewIndirectCostsDialog
    v-model="showNewIndirectCostsDialog"
    :indirectCosts="newIndirectCosts"
    @confirm="addSelectedIndirectCosts"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { LoaderCircle, RefreshCcw, Save, Trash2 } from 'lucide-vue-next';
import { ApiResponseStatus } from '@/types/api-response-status';
import { apiError } from '@/services/api.ts';
import projectApi from '@/services/project-api.ts';
import router from '@/router';
import { RouteNames } from '@/router/routes.ts';
import {
  Project,
  ProjectIndirectCost,
  ProjectindirectCostType,
  ProjectType,
  ProjectWorkCategory,
  ProjectWorkCategoryType,
} from '@/entities/project';
import Toast from '@/components/Toast.vue';
import TextInput from './inputs/TextInput.vue';
import NumberInput from './inputs/NumberInput.vue';
import IntInput from './inputs/IntInput.vue';
import CheckBox from './inputs/CheckBox.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import EntityTableBody from './EntityTableBody.vue';
import { EntityTableBodyProps, TableRow } from '@/types/entity-configs.ts';
import { WorkCategoryType } from '@/entities/work-category.ts';
import NewWorkCategoriesDialog from './NewWorkCategoriesDialog.vue';
import { formatCurrency, formatPercentage } from '@/utils/validation.ts';
import { IndirectCostType } from '@/entities/indirect-cost.ts';
import PercentageInput from './inputs/PercentageInput.vue';
import NewIndirectCostsDialog from './NewIndirectCostsDialog.vue';

const project = defineModel<ProjectType>({ required: true });
const props = defineProps<{ hasUnsavedChanges: boolean; changedFields: Set<string> }>();
const projectConfigs = computed(() => Project.getConfigs());
const projectEntity = computed(() => project.value as Record<string, unknown>);

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });

const isEditing = ref(false);

const workCategories = ref<WorkCategoryRow[]>([]);
const workCategoryConfigs = computed(() => ProjectWorkCategory.getConfigs());

const workCategoryTable = computed<EntityTableBodyProps<ProjectWorkCategoryType>>(() => ({
  rows: workCategories.value,
  configs: workCategoryConfigs.value,
  handlers: {
    reorder: reorderWorkCategories,
  },
  rowIsActive: isActiveWorkCategory,
  isValid: (workCategory) => ProjectWorkCategory.isValid(workCategory, workCategoryConfigs.value),
  isEditing: isEditing,
}));

const newWorkCategories = ref<WorkCategoryType[]>([]);
const showNewWorkCategoriesDialog = ref(false);

const indirectCosts = ref<IndirectCostRow[]>([]);
const indirectCostsConfigs = computed(() => ProjectIndirectCost.getConfigs());

const indirectCostsTable = computed<EntityTableBodyProps<ProjectindirectCostType>>(() => ({
  rows: indirectCosts.value,
  configs: indirectCostsConfigs.value,
  handlers: {
    reorder: reorderIndirectCosts,
  },
  rowIsActive: isActiveIndirectCost,
  isValid: (indirectCost) => ProjectIndirectCost.isValid(indirectCost, indirectCostsConfigs.value),
  isEditing: isEditing,
}));

const newIndirectCosts = ref<IndirectCostType[]>([]);
const showNewIndirectCostsDialog = ref(false);

const emit = defineEmits<{
  reload: [];
  saved: [];
}>();

/*************************************************************************************************************** LOAD */

onMounted(async () => {
  await getWorkCategories();
  await getIndirectCosts();
});

watch(
  workCategories,
  (rows) => {
    project.value.workCategories = rows.map((row) => row.entity);
  },
  { deep: true },
);

watch(
  indirectCosts,
  (rows) => {
    project.value.indirectCosts = rows.map((row) => row.entity);
  },
  { deep: true },
);

function isFieldChanged(field: string): boolean {
  return props.changedFields.has(field);
}

function isWorkCategoryFieldChanged(row: WorkCategoryRow, field: string): boolean {
  const index = project.value.workCategories?.findIndex((item) => item === row.entity) ?? -1;
  return index >= 0 && props.changedFields.has(`workCategories[${index}].${field}`);
}

function isIndirectCostFieldChanged(row: IndirectCostRow, field: string): boolean {
  const index = project.value.indirectCosts?.findIndex((item) => item === row.entity) ?? -1;
  return index >= 0 && props.changedFields.has(`indirectCosts[${index}].${field}`);
}

async function getWorkCategories() {
  workCategories.value = project.value.workCategories!.map((workCategory) => ({
    entity: {
      ...workCategory,
    },
    _key: workCategory.id ?? nextKeyWorkCategory(),
    _isNew: false,
    _isEdited: true,
    _expanded: true,
  }));
}

async function getIndirectCosts() {
  indirectCosts.value = project.value.indirectCosts!.map((indirectCost) => ({
    entity: {
      ...indirectCost,
    },
    _key: indirectCost.id ?? nextKeyIndirectCost(),
    _isNew: false,
    _isEdited: true,
    _expanded: true,
  }));
}

/**************************************************************************************************************** ROW */

interface WorkCategoryRow extends TableRow<ProjectWorkCategoryType> {}

let _keyCounterWorkCategory = 0;
function nextKeyWorkCategory(): string {
  return `row-${++_keyCounterWorkCategory}`;
}

function isActiveWorkCategory(workCategory: WorkCategoryRow) {
  return workCategory.entity.isIncluded!;
}

interface IndirectCostRow extends TableRow<ProjectindirectCostType> {}

let _keyCounterIndirectCost = 0;
function nextKeyIndirectCost(): string {
  return `row-${++_keyCounterIndirectCost}`;
}

function isActiveIndirectCost(indirectCost: IndirectCostRow) {
  return indirectCost.entity.isIncluded!;
}

/************************************************************************************************************* REORDER*/

function reorderWorkCategories(rows: WorkCategoryRow[]): void {
  rows.forEach((row, index) => {
    row.entity.index = index + 1;
  });

  project.value.workCategories = rows.map((row) => row.entity);
}

function reorderIndirectCosts(rows: IndirectCostRow[]): void {
  rows.forEach((row, index) => {
    row.entity.index = index + 1;
  });

  project.value.indirectCosts = rows.map((row) => row.entity);
}

/************************************************************************************* REFRESH WORK CATEGORIES & ITEMS*/

async function getNewWorkCategoriesAndItems() {
  if (!project.value.id) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    const categories = await projectApi.getNewWorkCategoriesAndItems(project.value.id);

    newWorkCategories.value = categories;
    showNewWorkCategoriesDialog.value = true;

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível actualizar as especialidades.');
  }
}

function addSelectedWorkCategories(categories: WorkCategoryType[]) {
  categories.forEach((category) => {
    const existingRow = workCategories.value.find((row) => row.entity.workCategoryId === category.id);

    if (!existingRow) {
      workCategories.value.push({
        entity: {
          workCategoryId: category.id,
          description: category.description,
          index: workCategories.value.length + 1,
          isIncluded: true,
          margin: 15,
          workItems: (category.workItems ?? []).map((workItem, index) => ({
            workItemId: workItem.id,
            description: workItem.description,
            units: workItem.units,
            unitPrice: workItem.unitPrice,
            index: index + 1,
            isIncluded: true,
          })),
        },
        _key: category.id!,
        _isNew: true,
        _isEdited: true,
        _expanded: true,
      });

      return;
    }

    const existingWorkItems = existingRow.entity.workItems ?? [];
    const existingWorkItemIds = new Set(existingWorkItems.map((workItem) => workItem.workItemId).filter(Boolean));
    const newWorkItems = (category.workItems ?? []).filter((workItem) => !existingWorkItemIds.has(workItem.id));

    if (newWorkItems.length === 0) {
      return;
    }

    const nextIndex = existingWorkItems.length + 1;

    existingRow.entity.workItems = [
      ...existingWorkItems,
      ...newWorkItems.map((workItem, index) => ({
        workItemId: workItem.id,
        description: workItem.description,
        units: workItem.units,
        unitPrice: workItem.unitPrice,
        index: nextIndex + index,
        isIncluded: true,
      })),
    ];

    existingRow._isEdited = true;
  });

  project.value.workCategories = workCategories.value.map((row) => row.entity);
}

/********************************************************************************************** REFRESH INDIRECT COSTS*/

async function getNewIndirectCosts() {
  if (!project.value.id) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    const indirectCosts = await projectApi.getNewindirectCosts(project.value.id);

    newIndirectCosts.value = indirectCosts;
    showNewIndirectCostsDialog.value = true;

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível actualizar os custos indiretos.');
  }
}

function addSelectedIndirectCosts(indirectCostsToAdd: IndirectCostType[]) {
  indirectCostsToAdd.forEach((indirectCostToAdd) => {
    const existingRow = indirectCosts.value.find((row) => row.entity.indirectCostId === indirectCostToAdd.id);

    if (!existingRow) {
      indirectCosts.value.push({
        entity: {
          indirectCostId: indirectCostToAdd.id,
          description: indirectCostToAdd.description,
          index: workCategories.value.length + 1,
          isIncluded: true,
          value: indirectCostToAdd.value,
        },
        _key: indirectCostToAdd.id!,
        _isNew: true,
        _isEdited: true,
        _expanded: true,
      });

      return;
    }

    existingRow._isEdited = true;
  });

  project.value.indirectCosts = indirectCosts.value.map((row) => row.entity);
}

/*************************************************************************************************************** SAVE */

async function saveProject() {
  if (!project.value.id) {
    return;
  }

  project.value.workCategories = workCategories.value.map((row) => row.entity);
  project.value.indirectCosts = indirectCosts.value.map((row) => row.entity);

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

/************************************************************************************************************* DELETE */

const showDeleteDialog = ref(false);

function askDelete() {
  showDeleteDialog.value = true;
}

async function confirmDelete(): Promise<void> {
  if (!project.value.id) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    await projectApi.deleteProject(project.value.id);

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false, message: 'Projeto eliminado com sucesso.' };

    showDeleteDialog.value = false;
    goToProjectsList();
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Erro ao eliminar o projeto.');
  }
}

/************************************************************************************************************* NAVIGATION */

function goToProjectsList() {
  router.push({ name: RouteNames.projectsList });
}
</script>

<style lang="scss">
.work-categories-section {
  grid-column: 2;
}

.financial-summary-section {
  grid-column: 3;
}

.work-categories-section,
.financial-summary-section {
  grid-row: 1 / span 2;

  .table table {
    th {
      padding: 5px 6px;
      font-size: 12px;
    }

    td {
      padding: 5px 6px;
      font-size: 11px;
      line-height: 1.2;
    }

    input,
    textarea,
    select {
      padding: 3px 4px;
    }
  }
}
</style>
