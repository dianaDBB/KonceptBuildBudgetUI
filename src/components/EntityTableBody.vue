<template>
  <tbody ref="tableBody">
    <template v-for="row in props.rows.rows" :key="row._key">
      <tr
        :class="{
          disabled: !isRowActive(row),
          'main-row-expanded': hasChildren(row),
        }"
        @dblclick="!props.rows.isEditing.value && props.rows.handlers.edit?.(row)"
        @click="
          !props.rows.isEditing.value &&
            (props.rows.handlers.click?.(row), hasChildren(row) && props.rows.handlers.toggle?.(row))
        "
      >
        <template v-if="props.subrows || props.rows.isChild">
          <td style="width: 20px; padding: 0">
            <component v-if="hasChildren(row)" :is="row._expanded ? ChevronDown : ChevronRight" :size="18" />
          </td>
        </template>

        <td
          v-for="(config, fieldKey, index) in props.rows.configs"
          :key="fieldKey"
          :style="config.styleConfig.columnStyle"
          :class="[getColumnClasses(fieldKey, row.entity), { editing: rowHasChanges(row) }]"
        >
          <template v-if="rowHasChanges(row)">
            <slot :name="`edit-${fieldKey}`" :row="row" :config="config" :field-key="fieldKey">
              <component
                :is="getEditableComponent(config.type)"
                :value="
                  config.type == ColumnType.LABEL ? config.displayValue(row.entity) : getFieldValue(row, fieldKey)
                "
                :entity="row.entity"
                :field-key="fieldKey"
                :secondary-value="
                  config.phoneConfig?.secondaryField
                    ? getFieldValue(row, String(config.phoneConfig.secondaryField))
                    : ''
                "
                :config="config"
                :select-options="config.selectConfig?.options"
                :search-select-options="
                  typeof config.searchSelectConfig?.options == 'function'
                    ? config.searchSelectConfig.options(
                        row.entity,
                        props.rows.rows.map((r) => r.entity),
                      )
                    : config.searchSelectConfig?.options
                "
                :search-select-multiple-options="
                  typeof config.searchSelectMultipleConfig?.options == 'function'
                    ? config.searchSelectMultipleConfig?.options(row.entity)
                    : config.searchSelectMultipleConfig
                "
                :search-select-multiple-option-key="config.searchSelectMultipleConfig?.optionKey"
                :is-invalid="config.styleConfig.isInvalid(row.entity)"
                :is-disabled="config.styleConfig.showDisabled(row.entity, row)"
                @update:value="updateFieldValue(row, fieldKey, $event)"
                @update:secondary-value="
                  config.phoneConfig?.secondaryField
                    ? updateFieldValue(row, String(config.phoneConfig.secondaryField), $event)
                    : undefined
                "
              />
            </slot>
          </template>

          <template v-else>
            <slot :name="`display-${fieldKey}`" :row="row" :config="config" :field-key="fieldKey">
              <div v-if="index === 0">
                <template v-if="config.type === ColumnType.SEARCH_SELECT">
                  <div class="with-info-tooltip">
                    <span>{{ config.displayValue(row.entity) }}</span>

                    <InfoTooltip
                      v-if="getFieldValue(row, fieldKey)"
                      position="left"
                      :title="config.searchSelectConfig?.tooltipTitle?.(getFieldValue(row, fieldKey) as TEntity)"
                      :items="config.searchSelectConfig?.tooltipItems?.(getFieldValue(row, fieldKey) as TEntity)"
                    />
                  </div>
                </template>

                <template v-else>
                  {{ config.displayValue(row.entity) }}
                </template>
              </div>

              <template v-else>
                <template v-if="config.type === ColumnType.SEARCH_SELECT">
                  <div class="with-info-tooltip">
                    <span>{{ config.displayValue(row.entity) }}</span>

                    <InfoTooltip
                      v-if="getFieldValue(row, fieldKey)"
                      position="left"
                      :title="config.searchSelectConfig?.tooltipTitle?.(getFieldValue(row, fieldKey) as TEntity)"
                      :items="config.searchSelectConfig?.tooltipItems?.(getFieldValue(row, fieldKey) as TEntity)"
                    />
                  </div>
                </template>
                <template v-else>
                  {{ config.displayValue(row.entity) }}
                </template>
              </template>
            </slot>
          </template>
        </td>

        <td v-if="hasHandlers" class="actions-column">
          <div v-if="!rowHasChanges(row)" class="action-buttons">
            <slot name="row-actions" :row="row" :isSubrow="!props.subrows">
              <button
                v-if="props.rows.handlers.delete"
                title="Eliminar"
                :disabled="props.rows.isEditing.value"
                @click="props.rows.handlers.delete(row)"
              >
                <Trash2 :size="16" />
              </button>

              <button
                v-if="props.rows.handlers.edit"
                title="Editar"
                :disabled="props.rows.isEditing.value"
                @click="props.rows.handlers.edit(row)"
              >
                <Pencil :size="16" />
              </button>
            </slot>
          </div>

          <div v-else class="action-buttons editing">
            <button
              v-if="props.rows.handlers.discard"
              title="Descartar alterações"
              @click="props.rows.handlers.discard(row)"
            >
              <Undo2 :size="16" />
            </button>

            <button
              v-if="props.rows.handlers.save"
              title="Guardar alterações"
              :disabled="!isRowValid(row.entity)"
              @click="props.rows.handlers.save(row)"
            >
              <Check :size="16" />
            </button>
          </div>
        </td>
      </tr>

      <tr v-if="row._expanded && props.subrows">
        <td :colspan="totalColumns">
          <table>
            <colgroup>
              <!--expand column-->
              <col style="width: 20px" />
              <col
                v-for="config in Object.values(props.subrows.configs)"
                :key="config.label"
                :style="config.styleConfig.columnStyle"
              />
              <!--actions column-->
              <col v-if="hasHandlers" style="width: 130px" />
            </colgroup>
            <EntityTableBody
              :rows="{
                rows: props.subrows.rows(row.entity),
                configs: props.subrows.configs,
                handlers: props.subrows.handlers,
                rowIsActive: props.subrows.rowIsActive,
                isValid: props.subrows.isValid,
                isEditing: props.subrows.isEditing,
                isChild: true,
              }"
            >
              <!-- @vue-ignore -->
              <template #row-actions="{ row: subrow }">
                <slot name="row-actions" :row="subrow" :isSubrow="true" />
              </template>
            </EntityTableBody>
          </table>
        </td>
      </tr>
    </template>
  </tbody>
</template>

<script setup lang="ts" generic="TEntity extends EntityType, TParentEntity extends EntityType">
import {
  EntityType,
  EntityTableBodyProps,
  EntityTableBodySubrowProps,
  ColumnType,
  TableRow,
} from '@/types/entity-configs';
import { Trash2, Pencil, Undo2, Check, ChevronDown, ChevronRight } from 'lucide-vue-next';
import { computed, type Component } from 'vue';
import TextInput from './inputs/TextInput.vue';
import NumberInput from './inputs/NumberInput.vue';
import MoneyInput from './inputs/MoneyInput.vue';
import DateInput from './inputs/DateInput.vue';
import SelectInput from './inputs/SelectInput.vue';
import SearchSelectInput from './inputs/SearchSelectInput.vue';
import SearchSelectMultipleInput from './inputs/SearchSelectMultipleInput.vue';
import EmailInput from './inputs/EmailInput.vue';
import PhoneInput from './inputs/PhoneInput.vue';
import PercentageInput from './inputs/PercentageInput.vue';
import Label from './inputs/Label.vue';
import InfoTooltip from './InfoTooltip.vue';
import IntInput from './inputs/IntInput.vue';
import CheckBox from './inputs/CheckBox.vue';

interface Props {
  rows: EntityTableBodyProps<TEntity>;
  subrows?: EntityTableBodySubrowProps<TParentEntity, TEntity>;
}

const props = defineProps<Props>();

const editableComponentMap: Record<ColumnType, Component | undefined> = {
  [ColumnType.TEXT]: TextInput,
  [ColumnType.NUMBER]: NumberInput,
  [ColumnType.INT]: IntInput,
  [ColumnType.MONEY]: MoneyInput,
  [ColumnType.DATE]: DateInput,
  [ColumnType.SELECT]: SelectInput,
  [ColumnType.SEARCH_SELECT]: SearchSelectInput,
  [ColumnType.SEARCH_SELECT_MULTIPLE]: SearchSelectMultipleInput,
  [ColumnType.EMAIL]: EmailInput,
  [ColumnType.PHONE]: PhoneInput,
  [ColumnType.PERCENTAGE]: PercentageInput,
  [ColumnType.LABEL]: Label,
  [ColumnType.CHECK_BOX]: CheckBox,
};

const hasHandlers = computed(() => {
  const handlers = props.rows.handlers;

  return !!(handlers.delete || handlers.edit || handlers.discard || handlers.save);
});

const totalColumns = computed(() => {
  const dataColumns = Object.keys(props.rows.configs).length;
  const expandColumn = props.subrows || props.rows.isChild ? 1 : 0;
  const actionsColumn = hasHandlers.value ? 1 : 0;

  return expandColumn + dataColumns + actionsColumn;
});

function hasChildren(row: TableRow<TEntity>) {
  return !!props.subrows && props.subrows.rows(row.entity).length > 0;
}

function getEditableComponent(type: ColumnType): Component | undefined {
  return editableComponentMap[type];
}

function rowHasChanges(row: TableRow<TEntity>): boolean {
  return row._isNew || row._isEdited;
}

function isRowValid(entity: TEntity): boolean {
  return props.rows.isValid(entity);
}

function isRowActive(row: TableRow<TEntity>): boolean {
  return props.rows.rowIsActive(row);
}

function getColumnClasses(fieldKey: string, entity: TEntity): Record<string, boolean> {
  const styleConfig = props.rows.configs[fieldKey].styleConfig;

  const classes = typeof styleConfig.classes === 'function' ? styleConfig.classes(entity) : styleConfig.classes;

  return {
    highlight: styleConfig.isHighlight ?? false,
    ...(typeof classes === 'object' ? classes : {}),
    ...(typeof classes === 'string' ? { [classes]: true } : {}),
  };
}

function getFieldValue(row: TableRow<TEntity>, fieldKey: string | number | symbol): unknown {
  const path = String(fieldKey);

  return path.split('.').reduce<unknown>((obj, key) => {
    if (typeof obj === 'object' && obj !== null && key in obj) {
      return (obj as Record<string, unknown>)[key];
    }

    return undefined;
  }, row.entity as Record<string, unknown>);
}

function updateFieldValue(row: TableRow<TEntity>, fieldKey: string, value: unknown) {
  const keys = fieldKey.split('.');
  const lastKey = keys.pop()!;

  const target = keys.reduce<Record<string, unknown> | null>((obj, key) => {
    if (obj && typeof obj === 'object' && key in obj) {
      return obj[key] as Record<string, unknown>;
    }

    return null;
  }, row.entity as Record<string, unknown>);

  if (target && typeof target === 'object') {
    (target as Record<string, unknown>)[lastKey] = value;
  }

  row._isEdited = true;

  props.rows.configs[fieldKey]?.onValueChanged?.(row, value);
}
</script>

<style></style>
