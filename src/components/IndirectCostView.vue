<template>
  <div class="main-section" data-testid="work-categories">
    <div class="section-header" data-testid="header">
      <span><Euro :size="24" /></span>
      <h3>Custos Indiretos</h3>

      <div class="page-nav">
        <RouterLink :to="RoutePaths.projects.list" class="link"> Ir para Lista de Projetos </RouterLink>
      </div>
    </div>

    <div class="section">
      <div v-if="apiStatus.isLoading" class="loading-overlay" data-testid="loading">
        <div>
          <LoaderCircle :size="18" class="spinner" />
          A carregar custos diretos...
        </div>
      </div>
      <div class="section-body">
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
              <!--actions column-->
              <col style="width: 130px" />
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
                <!--actions column-->
                <th></th>
              </tr>
            </thead>
            <tbody ref="tableBody">
              <EntityTableBody :rows="indirectCostTable">
                <template #row-actions="{ row }">
                  <button
                    title="Eliminar custo direto"
                    :disabled="indirectCostTable.isEditing.value"
                    @click.stop="askDeleteIndirectCost(row as IndirectCostRow)"
                  >
                    <Trash2 :size="16" />
                  </button>

                  <button
                    title="Editar custo direto"
                    :disabled="indirectCostTable.isEditing.value"
                    @click.stop="startEditingIndirectCost(row as IndirectCostRow)"
                  >
                    <Pencil :size="16" />
                  </button>
                </template>
              </EntityTableBody>
            </tbody>
          </table>
        </div>

        <div class="actions">
          <button
            class="btn"
            :disabled="indirectCostTable.isEditing.value || apiStatus.isLoading"
            @click="addIndirectCost"
          >
            <Plus :size="18" /> Adicionar Custo Indireto
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
    v-model="showDeleteIndirectCostDialog"
    title="Eliminar especialidade"
    :message="[
      `${indirectCostToDelete?.entity.description}`,
      'Tem a certeza que quer eliminar definitivamente esta especialidade?',
    ]"
    confirm-text="Apagar"
    cancel-text="Cancelar"
    @confirm="confirmDeleteIndirectCost"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { ApiResponseStatus } from '@/types/api-response-status';
import { Plus, LoaderCircle, Trash2, Pencil, Euro } from 'lucide-vue-next';
import Toast from '@/components/Toast.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import { EntityTableBodyProps, TableRow } from '@/types/entity-configs.ts';
import { apiError } from '@/services/api.ts';
import EntityTableBody from './EntityTableBody.vue';
import { RoutePaths } from '@/router/routes.ts';
import { UUID } from 'node:crypto';
import { IndirectCost, IndirectCostType } from '@/entities/indirect-cost.ts';
import indirectCostApi from '@/services/indirect-cost-api.ts';

const apiStatus = ref<ApiResponseStatus>({ isLoading: false, isSuccess: false, isError: false });
const tableBody = ref<HTMLTableSectionElement | null>(null);

const indirectCosts = ref<IndirectCostRow[]>([]);
const indirectCostsConfigs = computed(() => IndirectCost.getConfigs());

const isEditing = ref(false);

const indirectCostTable = computed<EntityTableBodyProps<IndirectCostType>>(() => ({
  rows: indirectCosts.value,
  configs: indirectCostsConfigs.value,
  handlers: {
    edit: startEditingIndirectCost,
    delete: askDeleteIndirectCost,
    save: saveIndirectCost,
    discard: discardIndirectCostRow,
    reorder: reorderIndirectCost,
  },
  rowIsActive: isActive,
  isValid: (indirectCost) => IndirectCost.isValid(indirectCost, indirectCostsConfigs.value),
  isEditing: isEditing,
}));

/*************************************************************************************************************** LOAD */

onMounted(async () => {
  await getIndirectCosts();
});

async function getIndirectCosts() {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    const gotIndirectCosts = await indirectCostApi.getIndirectCosts();

    indirectCosts.value = gotIndirectCosts.map((indirectCost) => ({
      entity: {
        ...indirectCost,
      },
      _key: indirectCost.id ?? nextKey(),
      _isNew: false,
      _isEdited: false,
      _expanded: true,
    }));

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false };
  } catch (error: unknown) {
    apiStatus.value = apiError(error, 'Não foi possível carregar os custos indiretos.');
  }
}

/******************************************************************************************************** ROW ACTIONS */

interface IndirectCostRow extends TableRow<IndirectCostType> {}

let _keyCounter = 0;
function nextKey(): string {
  return `row-${++_keyCounter}`;
}

function isActive(row: IndirectCostRow) {
  return row.entity.isActive!;
}

function discardIndirectCostRow(row: IndirectCostRow) {
  if (row._isNew) {
    indirectCosts.value = indirectCosts.value.filter((indirectCost) => indirectCost !== row);
  } else {
    row.entity = row._original!;
    row._isNew = false;
    row._isEdited = false;
  }

  isEditing.value = false;
}

/*************************************************************************************************************** EDIT */

function startEditingIndirectCost(row: IndirectCostRow) {
  isEditing.value = true;

  row._isEdited = true;
  row._original = JSON.parse(JSON.stringify(row.entity));
}

/**************************************************************************************************************** ADD */

async function addIndirectCost(): Promise<void> {
  isEditing.value = true;

  indirectCosts.value.push({
    entity: {
      index: indirectCosts.value.length + 1,
      isActive: true,
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

async function saveIndirectCost(row: IndirectCostRow): Promise<void> {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    if (row._isNew) {
      await indirectCostApi.createIndirectCosts(row.entity);
    } else if (row._isEdited) {
      await indirectCostApi.updateIndirectCost(row.entity.id!, row.entity);
    }

    await getIndirectCosts();
    isEditing.value = false;

    apiStatus.value = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      message: 'Alterações guardadas com sucesso.',
    };
  } catch (error: unknown) {
    await getIndirectCosts();
    isEditing.value = false;
    apiStatus.value = apiError(error, 'Não foi possível guardar as alterações.');
  }
}

/************************************************************************************************************* DELETE */

const showDeleteIndirectCostDialog = ref(false);
const indirectCostToDelete = ref<IndirectCostRow | null>(null);

function askDeleteIndirectCost(row: IndirectCostRow) {
  indirectCostToDelete.value = row;
  showDeleteIndirectCostDialog.value = true;
}

async function confirmDeleteIndirectCost(): Promise<void> {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    if (!indirectCostToDelete.value?.entity.id) {
      return;
    }

    await indirectCostApi.deleteIndirectCost(indirectCostToDelete.value.entity.id);
    await getIndirectCosts();

    apiStatus.value = {
      isLoading: false,
      isSuccess: true,
      isError: false,
      message: 'Alterações guardadas com sucesso.',
    };

    showDeleteIndirectCostDialog.value = false;
    indirectCostToDelete.value = null;
  } catch (error: unknown) {
    await getIndirectCosts();
    apiStatus.value = apiError(error, 'Não foi possível guardar as alterações.');
  }
}

/************************************************************************************************************* REORDER*/

async function reorderIndirectCost(rows: IndirectCostRow[]): Promise<void> {
  apiStatus.value = { isLoading: true, isSuccess: false, isError: false };

  try {
    const indirectCostIds = rows.map((row) => row.entity.id).filter((id): id is UUID => id !== undefined);

    await indirectCostApi.reorderIndirectCosts(indirectCostIds);

    await getIndirectCosts();

    apiStatus.value = { isLoading: false, isSuccess: true, isError: false };
  } catch (error: unknown) {
    await getIndirectCosts();
    apiStatus.value = apiError(error, 'Não foi possível alterar a ordem dos custos indiretos.');
  }
}

/*********************************************************************************************************** IS ACTIVE*/

const previousIndirectCostActiveState = new Map<string, boolean>();

watch(
  () =>
    indirectCosts.value.map((row) => ({
      id: row.entity.id,
      isActive: row.entity.isActive,
    })),
  (newRows) => {
    for (const row of newRows) {
      if (!row.id) {
        continue;
      }

      const previousIsActive = previousIndirectCostActiveState.get(row.id);

      if (previousIsActive !== undefined && previousIsActive !== row.isActive) {
        const indirectCost = indirectCosts.value.find((indirectCostRow) => indirectCostRow.entity.id === row.id);

        if (!indirectCost) {
          continue;
        }
      }

      previousIndirectCostActiveState.set(row.id, row.isActive ?? false);
    }
  },
  { immediate: true },
);
</script>
<style lang="scss"></style>
