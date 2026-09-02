import { ColumnType, Configs } from '@/types/entity-configs';
import { formatCode, formatCurrency, formatNumber, formatSubCode } from '@/utils/validation';
import { ProjectWorkCategoryType, ProjectWorkItemType } from './project';

export class ClientBudgetCategory {
  static getConfigs(): Configs<ProjectWorkCategoryType> {
    return {
      code: {
        label: 'Cód.',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          isHighlight: false,
          columnStyle: {
            width: '60px',
          },
          classes: {
            'align-left': true,
          },
          headerClasses: {
            'align-left': true,
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => formatCode(workCategory.code),
      },
      description: {
        label: 'Descrição',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '600px',
          },
          classes: {
            'align-left': true,
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => workCategory.description,
      },
      units: {
        label: 'Un.',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '50px',
          },
        },
        displayValue: () => '',
      },
      quantity: {
        label: 'Qtd.',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '100px',
          },
          classes: {
            'align-right': true,
          },
          headerClasses: {
            'align-right': true,
          },
        },
        displayValue: () => '',
      },
      total: {
        label: 'TOTAL',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '120px',
          },
          classes: {
            'align-right': true,
          },
          headerClasses: {
            'align-right': true,
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => formatCurrency(workCategory.directCost),
      },
    };
  }

  static isValid(category: ProjectWorkCategoryType, configs: Configs<ProjectWorkCategoryType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(category));
  }
}

export class ClientBudgetItem {
  static getConfigs(): Configs<ProjectWorkItemType> {
    const workCategoryConfigs = ClientBudgetCategory.getConfigs();

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
      code: {
        ...workItemConfigs.code,
        displayValue: (workItem: ProjectWorkItemType) => formatSubCode(workItem.code),
      },
      description: {
        ...workItemConfigs.description,
        styleConfig: {
          ...workItemConfigs.description.styleConfig,
          showDisabled: (workItem: ProjectWorkItemType) => (workItem.isIncluded ? false : true),
          isInvalid: (workItem: ProjectWorkItemType) => (workItem.isIncluded ? !workItem.description : false),
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
      quantity: {
        ...workItemConfigs.quantity,
        styleConfig: {
          ...workItemConfigs.quantity.styleConfig,
          showDisabled: () => true,
          isInvalid: () => false,
        },
        displayValue: (workItem: ProjectWorkItemType) => (workItem.quantity ? formatNumber(workItem.quantity) : '-'),
      },
      total: {
        ...workItemConfigs.total,
        styleConfig: {
          ...workItemConfigs.total.styleConfig,
          showDisabled: () => true,
          isInvalid: () => false,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatCurrency(workItem.clientTotal),
      },
    };
  }

  static isValid(workItem: ProjectWorkItemType, configs: Configs<ProjectWorkItemType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(workItem));
  }
}
