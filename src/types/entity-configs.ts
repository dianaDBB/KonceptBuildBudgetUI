import { CSSProperties, Ref } from 'vue';
import { TableFilterKind } from './table-filter.type';
import { SelectOption } from './select-options.type';
import { UUID } from 'crypto';
import { TooltipItem } from './tootltip';

export interface EntityType {
  id?: UUID;
}

export interface TableRow<TEntity extends EntityType> {
  entity: TEntity;
  _key: string;
  _isNew: boolean;
  _isEdited: boolean;
  _original?: TEntity;
  _expanded?: boolean;
  _parentId?: UUID;
}

export interface EntityTableBodyProps<TEntity extends EntityType> {
  rows: TableRow<TEntity>[];
  configs: Configs<TEntity>;
  handlers: RowHandlers<TEntity>;
  rowIsActive: (row: TableRow<TEntity>) => boolean;
  isValid: (entity: TEntity) => boolean;
  isEditing: Ref<boolean>;
  isChild?: boolean;
}

export interface EntityTableBodySubrowProps<TEntity extends EntityType, TParentEntity extends EntityType>
  extends Omit<EntityTableBodyProps<TEntity>, 'rows'> {
  rows(parent: TParentEntity): TableRow<TEntity>[];
}

export interface RowHandlers<TEntity extends EntityType> {
  click?(row: TableRow<TEntity>): void;
  edit?(row: TableRow<TEntity>): void;
  save?(row: TableRow<TEntity>): void;
  delete?(row: TableRow<TEntity>): void;
  discard?(row: TableRow<TEntity>): void;
  toggle?(row: TableRow<TEntity>): void;
  reorder?(rows: TableRow<TEntity>[]): void;
}

export enum ColumnType {
  TEXT,
  NUMBER,
  INT,
  MONEY,
  DATE,
  SELECT,
  SEARCH_SELECT,
  SEARCH_SELECT_MULTIPLE,
  EMAIL,
  PHONE,
  PERCENTAGE,
  LABEL,
  CHECK_BOX,
}

export type Configs<TEntity extends EntityType> = Record<string, EntityConfig<TEntity>>;

export interface EntityConfig<TEntity extends EntityType> {
  label: string;
  additionalInfo?: {
    tooltipTitle?: string;
    tooltipItems?: TooltipItem[];
    tooltipInfo?: string[];
  };
  type: ColumnType;
  onValueChanged?: (row: TableRow<TEntity>, value: unknown) => void;

  selectConfig?: SelectConfig;
  searchSelectConfig?: SearchSelectConfig<TEntity>;
  searchSelectMultipleConfig?: SearchSelectMultipleConfig<TEntity>;
  phoneConfig?: PhoneConfig<TEntity>;

  styleConfig: StyleConfig<TEntity>;

  filterConfig?: FilterConfig;

  displayValue: (entity: TEntity) => string | number | undefined;
}

export interface StyleConfig<TEntity extends EntityType> {
  showDisabled: (entity: TEntity, row?: TableRow<TEntity>) => boolean;
  isInvalid: (entity: TEntity) => boolean;
  isHighlight?: boolean;
  columnStyle: CSSProperties;
  classes?: string | Record<string, boolean> | ((entity: EntityType) => string | Record<string, boolean> | undefined);
  headerClasses?: Record<string, boolean>;
}

export interface SearchSelectConfig<TEntity extends EntityType> {
  selected: (option: TEntity) => string;
  options: (entity: TEntity, alreadyUsedOptions?: TEntity[]) => TEntity[];
  optionLines: (option: TEntity) => string[];
  filter?: (option: TEntity) => string;
  tooltipTitle?: (value: TEntity) => string;
  tooltipItems?: (value: TEntity) => {
    label: string;
    value?: string | number | undefined;
  }[];
}

export interface SearchSelectMultipleConfig<TEntity extends EntityType> {
  selected: (options: TEntity[]) => string;
  options: (entity: TEntity) => TEntity[];
  optionKey?: (option: TEntity) => string;
  optionLines: (option: TEntity) => string[];
  filter?: (option: TEntity) => string;
  tooltipTitle?: (value: TEntity) => string;
  tooltipItems?: (value: TEntity) => {
    label: string;
    value?: string | number | undefined;
  }[];
}

export interface SelectConfig {
  options: SelectOption[];
}

export interface PhoneConfig<TEntity extends EntityType> {
  secondaryField: keyof TEntity;
}

export interface FilterConfig {
  column: string;
  kind: TableFilterKind;
  info?: string;
  valueConfig: SingleFilterConfig | RangeFilterConfig;
  dropdownAlign?: 'start' | 'end';
}

export interface SingleFilterConfig {
  valueKey: string;
}

export enum RangeFilterValueType {
  NUMBER = 'NUMBER',
  DATE = 'DATE',
}

export interface RangeFilterConfig {
  valueType: RangeFilterValueType;
  valueKey: string;
}

export interface RangeFilter {
  min: string | number | undefined;
  max: string | number | undefined;
}
