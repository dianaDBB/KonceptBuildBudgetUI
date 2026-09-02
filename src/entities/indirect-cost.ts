import { ColumnType, Configs, EntityType } from '@/types/entity-configs';
import { formatCurrency } from '@/utils/validation';

export interface IndirectCostType extends EntityType {
  index?: number;
  code?: string;
  description?: string;
  value?: number;
  isActive?: boolean;
}

export class IndirectCost {
  static getConfigs(): Configs<IndirectCostType> {
    return {
      code: {
        label: 'Cod.',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          isHighlight: false,
          columnStyle: {
            width: '50px',
          },
          classes: {
            'align-left': true,
          },
          headerClasses: {
            'align-left': true,
          },
        },
        displayValue: (indirectCost: IndirectCostType) => indirectCost.code,
      },
      description: {
        label: 'Descrição',
        type: ColumnType.TEXTAREA,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (indirectCost: IndirectCostType) => !indirectCost.description,
          columnStyle: {
            width: '200px',
          },
          classes: {
            'align-left': true,
          },
        },
        displayValue: (indirectCost: IndirectCostType) => indirectCost.description,
      },
      value: {
        label: 'Valor (€)',
        type: ColumnType.MONEY,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (indirectCost: IndirectCostType) => indirectCost.value == undefined || indirectCost.value < 0,
          columnStyle: {
            width: '200px',
          },
          classes: {
            'align-right': true,
          },
          headerClasses: {
            'align-right': true,
          },
        },
        displayValue: (indirectCost: IndirectCostType) => formatCurrency(indirectCost.value),
      },
      isActive: {
        label: 'Activo',
        type: ColumnType.CHECK_BOX,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '200px',
          },
        },
        displayValue: (indirectCost: IndirectCostType) => (indirectCost.isActive ? 'Sim' : 'Não'),
      },
    };
  }

  static isValid(indirectCost: IndirectCostType, configs: Configs<IndirectCostType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(indirectCost));
  }
}
