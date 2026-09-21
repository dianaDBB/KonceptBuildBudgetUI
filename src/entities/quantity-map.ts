import { ColumnType, Configs } from '@/types/entity-configs';
import { formatCurrency, formatNumber } from '@/utils/validation';
import { ProjectWorkCategoryType, ProjectWorkItemType } from './project';

export class QuantityMapCategory {
  static getConfigs(): Configs<ProjectWorkCategoryType> {
    return {
      isIncluded: {
        label: '',
        type: ColumnType.CHECK_BOX,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '30px',
          },
        },
        displayValue: () => '',
      },
      code: {
        label: 'Cód.',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          isHighlight: false,
          columnStyle: {
            width: '50px',
            'font-weight': 600,
          },
          classes: {
            'align-left': true,
          },
          headerClasses: {
            'align-left': true,
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => workCategory.code,
      },
      description: {
        label: 'Descrição',
        type: ColumnType.TEXTAREA,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (workCategory: ProjectWorkCategoryType) => !workCategory.description,
          columnStyle: {
            width: '620px',
            'font-weight': 800,
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
        label: 'Qt.',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '80px',
          },
        },
        displayValue: () => '',
      },
      unitPrice: {
        label: 'Preço Un. (€)',
        type: ColumnType.MONEY,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '80px',
          },
        },
        displayValue: () => '',
      },
      totalMaterials: {
        label: 'TOTAL Materiais (€)',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '100px',
            'font-weight': 600,
          },
          classes: {
            'align-right': true,
          },
          headerClasses: {
            'align-right': true,
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => formatCurrency(workCategory.directCostMaterials),
      },
      laborHours: {
        label: 'Mão Obra (horas)',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '80px',
          },
        },
        displayValue: () => '',
      },
      customHourlyLaborCost: {
        label: 'Mão Obra (€/hora)',
        type: ColumnType.MONEY,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '80px',
          },
        },
        displayValue: () => '',
      },
      totalLabor: {
        label: 'TOTAL MãoObra (€)',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '100px',
            'font-weight': 600,
          },
          classes: {
            'align-right': true,
          },
          headerClasses: {
            'align-right': true,
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => formatCurrency(workCategory.directCostLabor),
      },
      total: {
        label: 'TOTAL',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '120px',
            'font-weight': 600,
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
      notes: {
        label: 'Notas',
        type: ColumnType.TEXTAREA,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '200px',
          },
          classes: {
            'align-left': true,
          },
        },
        displayValue: () => '',
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
      isIncluded: {
        ...workItemConfigs.isIncluded,
        styleConfig: {
          ...workItemConfigs.isIncluded.styleConfig,
          showDisabled: () => false,
          isInvalid: () => false,
        },
        displayValue: (workItem: ProjectWorkItemType) => (workItem.isIncluded ? 'Sim' : 'Não'),
      },
      code: {
        ...workItemConfigs.code,
        displayValue: (workItem: ProjectWorkItemType) => workItem.code,
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
          showDisabled: (workItem: ProjectWorkItemType) => (workItem.isIncluded ? false : true),
          isInvalid: (workItem: ProjectWorkItemType) =>
            workItem.isIncluded ? workItem.quantity == undefined || workItem.quantity < 0 : false,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatNumber(workItem.quantity),
      },
      unitPrice: {
        ...workItemConfigs.unitPrice,
        styleConfig: {
          ...workItemConfigs.unitPrice.styleConfig,
          showDisabled: (workItem: ProjectWorkItemType) => (workItem.isIncluded ? false : true),
          isInvalid: (workItem: ProjectWorkItemType) =>
            workItem.isIncluded ? workItem.unitPrice == undefined || workItem.unitPrice < 0 : false,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatCurrency(workItem.unitPrice),
      },
      totalMaterials: {
        ...workItemConfigs.totalMaterials,
        styleConfig: {
          ...workItemConfigs.totalMaterials.styleConfig,
          showDisabled: (workItem: ProjectWorkItemType) => (workItem.isIncluded ? false : true),
          isInvalid: (workItem: ProjectWorkItemType) =>
            workItem.isIncluded ? workItem.totalMaterials == undefined || workItem.totalMaterials < 0 : false,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatCurrency(workItem.totalMaterials),
      },
      laborHours: {
        ...workItemConfigs.laborHours,
        styleConfig: {
          ...workItemConfigs.laborHours.styleConfig,
          showDisabled: (workItem: ProjectWorkItemType) => (workItem.isIncluded ? false : true),
          isInvalid: (workItem: ProjectWorkItemType) =>
            workItem.isIncluded ? workItem.laborHours == undefined || workItem.laborHours < 0 : false,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatNumber(workItem.laborHours),
      },
      customHourlyLaborCost: {
        ...workItemConfigs.customHourlyLaborCost,
        styleConfig: {
          ...workItemConfigs.customHourlyLaborCost.styleConfig,
          showDisabled: (workItem: ProjectWorkItemType) => (workItem.isIncluded ? false : true),
          isInvalid: (workItem: ProjectWorkItemType) =>
            workItem.isIncluded
              ? workItem.customHourlyLaborCost == undefined || workItem.customHourlyLaborCost < 0
              : false,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatCurrency(workItem.customHourlyLaborCost),
      },
      totalLabor: {
        ...workItemConfigs.totalLabor,
        styleConfig: {
          ...workItemConfigs.totalLabor.styleConfig,
          showDisabled: () => true,
          isInvalid: () => false,
        },
        displayValue: (workItem: ProjectWorkItemType) => formatCurrency(workItem.totalLabor),
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
          showDisabled: (workItem: ProjectWorkItemType) => (workItem.isIncluded ? false : true),
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
