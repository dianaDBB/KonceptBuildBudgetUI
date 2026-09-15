<template>
  <div v-if="apiStatus.isLoading" class="loading-overlay">
    <div>
      <LoaderCircle :size="18" class="spinner" />
      A carregar projeto...
    </div>
  </div>

  <div class="table">
    <table>
      <colgroup>
        <col
          v-for="config in Object.values(paymentStagesConfigs)"
          :key="config.label"
          :style="config.styleConfig.columnStyle"
        />
      </colgroup>
      <thead>
        <tr>
          <th
            v-for="config in Object.values(paymentStagesConfigs)"
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
        <EntityTableBody :rows="paymentStagesTable">
          <template #row-actions="{ row }">
            <button
              title="Eliminar fase de pagamento"
              :disabled="paymentStagesTable.isEditing.value"
              @click.stop="askDeletePaymentStage(row as PaymentStageRow)"
            >
              <Trash2 :size="16" />
            </button>

            <button
              title="Editar fase de pagamento"
              :disabled="paymentStagesTable.isEditing.value"
              @click.stop="startEditingPaymentStage(row as PaymentStageRow)"
            >
              <Pencil :size="16" />
            </button>
          </template>
        </EntityTableBody>
      </tbody>
    </table>
  </div>

  <div class="actions">
    <button class="btn" :disabled="paymentStagesTable.isEditing.value || apiStatus.isLoading" @click="addPaymentStage">
      <Plus :size="18" /> Adicionar Fase de Pagamento
    </button>
  </div>

  <!-- delete dialog-->
  <ConfirmDialog
    v-model="showDeletePaymentStageDialog"
    title="Eliminar fase de pagamento"
    :message="[
      `${paymentStageToDelete?.entity.description}`,
      'Tem a certeza que quer eliminar definitivamente esta fase de pagamento?',
    ]"
    confirm-text="Apagar"
    cancel-text="Cancelar"
    @confirm="confirmDeletePaymentStage"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { ApiResponseStatus } from '@/types/api-response-status';
import { ProjectPaymentStagesType, ProjectType } from '@/entities/project';
import { Configs, EntityTableBodyProps, TableRow } from '@/types/entity-configs';
import EntityTableBody from './EntityTableBody.vue';
import { ClientBudgetPaymentStages } from '@/entities/client-budget-payment-stages.ts';
import { Pencil, Plus, Trash2 } from 'lucide-vue-next';
import ConfirmDialog from './ConfirmDialog.vue';
import projectApi from '@/services/project-api.ts';
import { apiError } from '@/services/api.ts';

const project = defineModel<ProjectType>({ required: true });
const props = defineProps<{}>();

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });
const tableBody = ref<HTMLTableSectionElement | null>(null);

const emit = defineEmits<{
  reload: [];
  saved: [message: string];
  error: [message: string];
}>();

const paymentStages = ref<PaymentStageRow[]>([]);
const paymentStagesConfigs = computed<Configs<ProjectPaymentStagesType>>(() => {
  const configs = ClientBudgetPaymentStages.getConfigs();

  return {
    ...configs,
    percentage: {
      ...configs.percentage,
      onValueChanged: (row: PaymentStageRow) => {
        recalculateStageValue(row);
      },
    },
  };
});

const isEditing = ref(false);

const paymentStagesTable = computed<EntityTableBodyProps<ProjectPaymentStagesType>>(() => ({
  rows: paymentStages.value,
  configs: paymentStagesConfigs.value,
  handlers: {
    edit: startEditingPaymentStage,
    delete: askDeletePaymentStage,
    save: savePaymentStage,
    discard: discardPaymentStageRow,
  },
  rowIsActive: () => true,
  isValid: () => true,
  isEditing: isEditing,
}));

/*************************************************************************************************************** LOAD */

onMounted(async () => {
  await getPaymentStages();
});

watch(
  () => project.value.paymentStages,
  () => {
    getPaymentStages();
  },
  { deep: true },
);

async function getPaymentStages() {
  paymentStages.value = project.value.paymentStages!.map((ProjectPaymentStagesType) => ({
    entity: {
      ...ProjectPaymentStagesType,
    },
    _key: ProjectPaymentStagesType.id ?? nextKey(),
    _isNew: false,
    _isEdited: false,
  }));
}

function recalculateStageValue(row: PaymentStageRow): void {
  const baseTotal = project.value.totalWithoutTax ?? 0;
  const percentage = row.entity.percentage ?? 0;

  row.entity.value = (baseTotal * percentage) / 100;
}

/******************************************************************************************************** ROW ACTIONS */

interface PaymentStageRow extends TableRow<ProjectPaymentStagesType> {}

let _keyCounter = 0;
function nextKey(): string {
  return `row-${++_keyCounter}`;
}

function discardPaymentStageRow(row: PaymentStageRow) {
  if (row._isNew) {
    paymentStages.value = paymentStages.value.filter((paymentStage) => paymentStage !== row);
  } else {
    row.entity = row._original!;
    row._isNew = false;
    row._isEdited = false;
  }

  isEditing.value = false;
}

/*************************************************************************************************************** EDIT */

function startEditingPaymentStage(row: PaymentStageRow) {
  isEditing.value = true;

  row._isEdited = true;
  row._original = JSON.parse(JSON.stringify(row.entity));
}

/**************************************************************************************************************** ADD */

async function addPaymentStage(): Promise<void> {
  isEditing.value = true;

  paymentStages.value.push({
    entity: {
      auto: paymentStages.value.length + 1,
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

/*************************************************************************************************************** SAVE */

async function savePaymentStage(): Promise<void> {
  if (!project.value.id) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  const updatedStages = paymentStages.value.map((row) => ({ ...row.entity }));
  const projectToSave: ProjectType = {
    ...project.value,
    paymentStages: updatedStages,
  };

  try {
    await projectApi.updateProject(project.value.id, projectToSave);

    project.value.paymentStages = updatedStages;

    paymentStages.value.forEach((row) => {
      row._isNew = false;
      row._isEdited = false;
      row._original = undefined;
    });

    isEditing.value = false;

    emit('saved', 'Alterações nas fases de pagamento guardadas com sucesso.');
    emit('reload');
  } catch (error: unknown) {
    const err = apiError(error, 'Não foi possível guardar as alterações nas fases de pagamento.');
    emit('error', err.message ?? 'Não foi possível guardar as alterações nas fases de pagamento.');
  } finally {
    apiStatus.value.isLoading = false;
  }
}

/************************************************************************************************************* DELETE */

const showDeletePaymentStageDialog = ref(false);
const paymentStageToDelete = ref<PaymentStageRow | null>(null);

function askDeletePaymentStage(row: PaymentStageRow) {
  paymentStageToDelete.value = row;
  showDeletePaymentStageDialog.value = true;
}

async function confirmDeletePaymentStage(): Promise<void> {
  if (!project.value.id) {
    return;
  }

  const stageIdToDelete = paymentStageToDelete.value?.entity.id;
  if (!stageIdToDelete) {
    return;
  }

  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  const remainingStages = (project.value.paymentStages ?? []).filter((stage) => stage.id !== stageIdToDelete);
  const projectToSave: ProjectType = {
    ...project.value,
    paymentStages: remainingStages,
  };

  try {
    await projectApi.updateProject(project.value.id, projectToSave);

    project.value.paymentStages = remainingStages;

    await getPaymentStages();
    showDeletePaymentStageDialog.value = false;
    paymentStageToDelete.value = null;

    emit('saved', 'Fase de pagamento eliminada com sucesso.');
    emit('reload');
  } catch (error: unknown) {
    await getPaymentStages();

    const err = apiError(error, 'Não foi possível eliminar a fase de pagamento.');
    emit('error', err.message ?? 'Não foi possível eliminar a fase de pagamento.');
    emit('reload');
  } finally {
    apiStatus.value.isLoading = false;
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
