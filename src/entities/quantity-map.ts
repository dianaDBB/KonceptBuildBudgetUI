import { ColumnType, Configs } from '@/types/entity-configs';
import { formatCurrency, formatIntNumber, formatNumber } from '@/utils/validation';
import { ProjectWorkCategoryType, ProjectWorkItemType } from './project';

export class QuantityMapCategory {
  static getConfigs(): Configs<ProjectWorkCategoryType> {
    return {
      index: {
        label: 'Cód.',
        type: ColumnType.INT,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          isHighlight: false,
          columnStyle: {
            width: '50px',
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => formatIntNumber(workCategory.index),
      },
      description: {
        label: 'Descrição',
        type: ColumnType.TEXTAREA,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (workCategory: ProjectWorkCategoryType) => !workCategory.description,
          columnStyle: {
            width: '600px',
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => workCategory.description,
      },
      units: {
        label: 'Un.',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '50px',
          },
        },
        displayValue: () => '---',
      },
      unitPrice: {
        label: 'Preço Unidade',
        type: ColumnType.MONEY,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '100px',
          },
        },
        displayValue: () => '---',
      },
      quantity: {
        label: 'Quantidade',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '100px',
          },
        },
        displayValue: () => '---',
      },
      total: {
        label: 'TOTAL',
        type: ColumnType.MONEY,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '100px',
          },
        },
        displayValue: () => '---',
      },
      notes: {
        label: 'Notas',
        type: ColumnType.TEXTAREA,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '400px',
          },
        },
        displayValue: () => '---',
      },
    };
  }

  static isValid(category: ProjectWorkCategoryType, configs: Configs<ProjectWorkCategoryType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(category));
  }
}

export class QuantityMapItem {
  static getConfigs(): Configs<ProjectWorkItemType> {
    const workCategoryConfigs = QuantityMapCategory.getConfigs();

    const workItemConfigs = Object.fromEntries(
      Object.entries(workCategoryConfigs).map(([key, config]) => [
        key,
        {
          ...config,
          styleConfig: {
            ...config.styleConfig,
            showDisabled: () => true,
            isInvalid: () => false,
          },
          displayValue: () => '---',
        },
      ]),
    ) as Configs<ProjectWorkCategoryType>;

    return {
      ...workItemConfigs,
      index: {
        ...workItemConfigs.index,
        displayValue: (workItem: ProjectWorkItemType) => formatIntNumber(workItem.index),
      },
      description: {
        ...workItemConfigs.description,
        styleConfig: {
          ...workItemConfigs.description.styleConfig,
          showDisabled: () => false,
          isInvalid: (workItem: ProjectWorkItemType) => !workItem.description,
        },
        displayValue: (workItem: ProjectWorkItemType) => workItem.description,
      },
      units: {
        ...workItemConfigs.units,
        styleConfig: {
          ...workItemConfigs.units.styleConfig,
          showDisabled: () => true,
          isInvalid: () => false,
        },
        displayValue: (workItem: ProjectWorkItemType) => workItem.units,
      },
      unitPrice: {
        ...workItemConfigs.unitPrice,
        styleConfig: {
          ...workItemConfigs.unitPrice.styleConfig,
          showDisabled: () => false,
          isInvalid: (workItem: ProjectWorkItemType) => !workItem.unitPrice,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatCurrency(workItem.unitPrice),
      },
      quantity: {
        ...workItemConfigs.quantity,
        styleConfig: {
          ...workItemConfigs.quantity.styleConfig,
          showDisabled: () => false,
          isInvalid: (workItem: ProjectWorkItemType) => !workItem.quantity,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatNumber(workItem.quantity),
      },
      total: {
        ...workItemConfigs.total,
        styleConfig: {
          ...workItemConfigs.total.styleConfig,
          showDisabled: () => true,
          isInvalid: () => false,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatCurrency(workItem.total),
      },
      notes: {
        ...workItemConfigs.notes,
        styleConfig: {
          ...workItemConfigs.notes.styleConfig,
          showDisabled: () => false,
          isInvalid: () => false,
        },
        displayValue: (workItem: ProjectWorkItemType) => workItem.notes,
      },
    };
  }

  static isValid(workItem: ProjectWorkItemType, configs: Configs<ProjectWorkItemType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(workItem));
  }
}
