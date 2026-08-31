import { ColumnType, Configs, EntityType } from '@/types/entity-configs';
import { formatCode } from '@/utils/validation';

export interface IndirectCostType extends EntityType {
  index?: number;
  code?: number;
  description?: string;
  value?: number;
  isActive?: boolean;
}

export class IndirectCost {
  static getConfigs(): Configs<IndirectCostType> {
    return {
      code: {
        label: 'Index',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          isHighlight: false,
          columnStyle: {
            width: '50px',
          },
        },
        displayValue: (indirectCost: IndirectCostType) => formatCode(indirectCost.code),
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
        },
        displayValue: (indirectCost: IndirectCostType) => indirectCost.description,
      },
      value: {
        label: 'Valor (€)',
        type: ColumnType.MONEY,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (indirectCost: IndirectCostType) => !indirectCost.value,
          columnStyle: {
            width: '200px',
          },
        },
        displayValue: (indirectCost: IndirectCostType) => indirectCost.value,
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
