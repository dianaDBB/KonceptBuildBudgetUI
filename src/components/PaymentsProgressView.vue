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
                <col style="width: 50px" />
                <col style="width: 500px" />
                <col style="width: 100px" />
                <col v-for="paymentIndex in payments" :key="paymentIndex" style="width: 60px" />
                <col style="width: 100px" />
                <col style="width: 100px" />
                <col style="width: 100px" />
              </colgroup>

              <thead>
                <tr>
                  <th class="align-left">Cod.</th>
                  <th>Descrição do Trabalho</th>
                  <th class="align-right">Total Orç. (€)</th>
                  <th v-for="paymentIndex in payments" :key="paymentIndex">{{ `Auto ${paymentIndex}` }}</th>
                  <th class="align-right">Acumulado (%)</th>
                  <th class="align-right">Acumulado (€)</th>
                  <th class="align-right">Por Faturar (€)</th>
                </tr>
              </thead>

              <tbody>
                <template v-for="row in tableRows" :key="row.key">
                  <tr :class="{ 'main-row': row.isCategory }">
                    <td class="align-left">
                      {{ row.code }}
                    </td>

                    <td class="align-left">
                      {{ row.description }}
                    </td>

                    <td class="align-right highlight">
                      {{ formatCurrency(row.valueWithMargin) }}
                    </td>

                    <td
                      v-for="paymentIndex in payments"
                      :key="paymentIndex"
                      :class="{ changed: isPaymentChanged(row, paymentIndex) }"
                      @keydown.capture="handleKeyboardNavigation(paymentIndex, $event)"
                    >
                      <PercentageInput
                        v-if="!row.isCategory && row.workItem"
                        :value="getPaymentPercentage(row.workItem, paymentIndex)"
                        :is-invalid="false"
                        :is-disabled="apiStatus.isLoading"
                        @update:value="updatePaymentPercentage(row.workItem, paymentIndex, $event)"
                      />
                    </td>

                    <td class="align-right highlight">
                      <template v-if="!row.isCategory && row.workItem">
                        {{ formatPercentage(row.cumulativeProgressPercentage) }}
                      </template>
                    </td>

                    <td class="align-right highlight">
                      <template v-if="!row.isCategory && row.workItem">
                        {{ formatCurrency(row.cumulativeProgressValue) }}
                      </template>
                    </td>

                    <td class="align-right highlight">
                      <template v-if="!row.isCategory && row.workItem">
                        {{ formatCurrency(row.remainingToInvoice) }}
                      </template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-actions">
      <button
        type="button"
        class="btn"
        :class="{
          'btn-highlight': !apiStatus.isLoading && props.hasUnsavedChanges,
        }"
        :disabled="apiStatus.isLoading || !props.hasUnsavedChanges"
        @click="saveProject"
      >
        Guardar Alterações
      </button>
    </div>
  </div>

  <Toast v-if="apiStatus.message" :message="apiStatus.message" :type="apiStatus.isSuccess ? 'success' : 'error'" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { LoaderCircle } from 'lucide-vue-next';
import { ApiResponseStatus } from '@/types/api-response-status';
import { apiError } from '@/services/api.ts';
import projectApi from '@/services/project-api.ts';
import {
  ProjectType,
  ProjectWorkCategoryType,
  ProjectWorkItemType,
  ProjectPaymentProgressType,
} from '@/entities/project';
import { formatCurrency, formatPercentage } from '@/utils/validation.ts';
import Toast from '@/components/Toast.vue';
import PercentageInput from '@/components/inputs/PercentageInput.vue';

const project = defineModel<ProjectType>({ required: true });

const props = defineProps<{
  hasUnsavedChanges: boolean;
  changedFields: Set<string>;
}>();

const emit = defineEmits<{
  reload: [];
  saved: [];
}>();

const apiStatus = ref<ApiResponseStatus>({
  isLoading: false,
  isSuccess: false,
  isError: false,
});

interface ProgressRow {
  key: string;
  isCategory: boolean;
  code?: string;
  description?: string;
  valueWithMargin: number;
  category?: ProjectWorkCategoryType;
  workItem?: ProjectWorkItemType;
  cumulativeProgressPercentage: number;
  cumulativeProgressValue: number;
  remainingToInvoice: number;
}

/*********************************************************************************************************** PAYMENTS */

const payments = computed<number[]>(() => {
  const count = project.value.progressPaymentsCount ?? 0;

  return Array.from({ length: count }, (_, index) => index + 1);
});

/************************************************************************************************************** TABLE */

const tableRows = computed<ProgressRow[]>(() => {
  const rows: ProgressRow[] = [];

  for (const workCategory of project.value.workCategories ?? []) {
    if (!workCategory.isIncluded) {
      continue;
    }

    const workItems = (workCategory.workItems ?? []).filter((item) => item.isIncluded);

    rows.push({
      key: `category-${workCategory.id ?? workCategory.workCategoryId ?? workCategory.code}`,
      isCategory: true,
      code: workCategory.code,
      description: workCategory.description,
      valueWithMargin: workCategory.valueWithMargin ?? 0,
      category: workCategory,
      cumulativeProgressPercentage: 0,
      cumulativeProgressValue: 0,
      remainingToInvoice: 0,
    });

    for (const workItem of workItems) {
      rows.push({
        key: `item-${workItem.id ?? workItem.workItemId ?? workItem.code}`,
        isCategory: false,
        code: workItem.code,
        description: workItem.description,
        valueWithMargin: workItem.clientTotal ?? 0,
        category: workCategory,
        workItem: workItem,
        cumulativeProgressPercentage: workItem.cumulativeProgressPercentage ?? 0,
        cumulativeProgressValue: workItem.cumulativeProgressValue ?? 0,
        remainingToInvoice: workItem.remainingToInvoice ?? 0,
      });
    }
  }

  return rows;
});

/************************************************************************************************** FIELDS NAVIGATION */

function handleKeyboardNavigation(paymentIndex: number, event: KeyboardEvent) {
  const isPrevious = event.key === 'ArrowLeft' || (event.key === 'Tab' && event.shiftKey);

  const isNext = event.key === 'ArrowRight' || (event.key === 'Tab' && !event.shiftKey);

  const isPreviousRow = event.key === 'ArrowUp';

  const isNextRow = event.key === 'ArrowDown' || event.key === 'Enter';

  if (!isPrevious && !isNext && !isPreviousRow && !isNextRow) {
    return;
  }

  const currentElement = event.target as HTMLElement;
  const currentRow = currentElement.closest('tr');

  if (!currentRow) {
    return;
  }

  let targetInput: HTMLElement | null = null;

  /*
   * LEFT / RIGHT / TAB
   *
   * Find the previous/next PercentageInput in the same row.
   */
  if (isPrevious || isNext) {
    const inputs = Array.from(
      currentRow.querySelectorAll<HTMLElement>(
        'input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [contenteditable="true"], [tabindex]:not([tabindex="-1"]):not(:disabled)',
      ),
    );

    const currentInputIndex = inputs.findIndex(
      (input) => input === currentElement || input.contains(currentElement) || currentElement.contains(input),
    );

    if (currentInputIndex !== -1) {
      const targetIndex = isPrevious ? currentInputIndex - 1 : currentInputIndex + 1;

      if (targetIndex >= 0 && targetIndex < inputs.length) {
        targetInput = inputs[targetIndex];
      }
    }
  }

  /*
   * UP / DOWN / ENTER
   *
   * Find the same payment column in the previous/next work-item row.
   * Category rows are automatically skipped.
   */
  if (isPreviousRow || isNextRow) {
    let targetRow = isPreviousRow ? currentRow.previousElementSibling : currentRow.nextElementSibling;

    while (targetRow) {
      if (targetRow instanceof HTMLTableRowElement) {
        const targetCells = Array.from(targetRow.children);
        const paymentColumnIndex = 3 + (paymentIndex - 1);
        const targetCell = targetCells[paymentColumnIndex];

        if (targetCell) {
          targetInput = targetCell.querySelector<HTMLElement>(
            'input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [contenteditable="true"], [tabindex]:not([tabindex="-1"]):not(:disabled)',
          );

          if (targetInput) {
            break;
          }
        }
      }

      targetRow = isPreviousRow ? targetRow.previousElementSibling : targetRow.nextElementSibling;
    }
  }

  // No target means this is the edge of the table.
  if (!targetInput) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  targetInput.focus();

  if (targetInput instanceof HTMLInputElement || targetInput instanceof HTMLTextAreaElement) {
    targetInput.select();
  }
}

/***************************************************************************************************** PAYMENT VALUES */

function getPaymentPercentage(workItem: ProjectWorkItemType, paymentIndex: number): number {
  const payment = workItem.progressPayments?.find((item) => item.paymentIndex === paymentIndex);

  return payment?.percentage ?? 0;
}

/************************************************************************************************************ CHANGES */

function isPaymentChanged(row: ProgressRow, paymentIndex: number): boolean {
  if (row.isCategory || !row.workItem) {
    return false;
  }

  const workItem = row.workItem;

  const parentCategory = project.value.workCategories?.find((category) =>
    category.workItems?.some((item) => item.workItemId === workItem.workItemId),
  );

  const parentIndex = project.value.workCategories?.findIndex((category) => category === parentCategory) ?? -1;

  const workItemIndex = parentCategory?.workItems?.findIndex((item) => item.workItemId === workItem.workItemId) ?? -1;

  if (parentIndex < 0 || workItemIndex < 0) {
    return false;
  }

  const paymentIndexInArray =
    workItem.progressPayments?.findIndex((payment) => payment.paymentIndex === paymentIndex) ?? -1;

  if (paymentIndexInArray < 0) {
    return false;
  }

  const basePath = `workCategories[${parentIndex}].workItems[${workItemIndex}].progressPayments`;

  return props.changedFields.has(basePath) || props.changedFields.has(`${basePath}[${paymentIndexInArray}].percentage`);
}

/************************************************************************************************************* UPDATE */

function updatePaymentPercentage(workItem: ProjectWorkItemType, paymentIndex: number, value: number | undefined) {
  if (!workItem.progressPayments) {
    workItem.progressPayments = [];
  }

  let payment = workItem.progressPayments.find((item) => item.paymentIndex === paymentIndex);

  if (!payment) {
    payment = {
      paymentIndex,
      percentage: 0,
    } as ProjectPaymentProgressType;

    workItem.progressPayments.push(payment);
  }

  payment.percentage = value ?? 0;
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

<style lang="scss"></style>
