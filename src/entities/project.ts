import { useConfigs } from '@/composables/useConfigs';
import { ColumnType, Configs, EntityType } from '@/types/entity-configs';
import { formatCurrency, formatPercentage } from '@/utils/validation';
import { UUID } from 'node:crypto';

export interface ProjectType extends EntityType {
  type?: string;
  description?: string;
  address?: string;
  client?: string;
  contact?: string;
  landArea?: number;
  implantationArea?: number;
  grossConstructionArea?: number;
  floorsCount?: number;
  ceilingHeight?: number;
  maxFacadeHeight?: number;
  roomsCount?: number;
  wcCount?: number;
  tax?: number;
  isActive?: boolean;
  workCategories?: ProjectWorkCategoryType[];
  indirectCosts?: ProjectindirectCostType[];
  totalDirectCost?: number;
  totalDirectCostPercentage?: number;
  totalWithoutTax?: number;
  totalWithoutTaxPercentage?: number;
  totalTax?: number;
  totalWithTax?: number;
  totalIndirectCost?: number;
  totalIndirectCostPercentage?: number;
  totalMarginProfit?: number;
  totalMarginProfitPercentage?: number;
  costPerSquareWithoutTax?: number;
  costPerSquareWithTax?: number;
}

export interface ProjectWorkCategoryType extends EntityType {
  workCategoryId?: UUID;
  isIncluded?: boolean;
  description?: string;
  index?: number;
  code?: string;
  margin?: number;
  directCost?: number;
  valueWithMargin?: number;
  workItems?: ProjectWorkItemType[];
}

export interface ProjectWorkItemType extends EntityType {
  workItemId?: UUID;
  isIncluded?: boolean;
  description?: string;
  index?: number;
  code?: string;
  units?: string;
  unitPrice?: number;
  quantity?: number;
  total?: number;
  notes?: string;
  clientTotal?: number;
}

export interface ProjectindirectCostType extends EntityType {
  indirectCostId?: UUID;
  isIncluded?: boolean;
  description?: string;
  index?: number;
  code?: string;
  value?: number;
}

export class Project {
  static getConfigs(): Configs<ProjectType> {
    const typeOptions = useConfigs().typeOptions.value;

    return {
      type: {
        label: 'Tipo',
        type: ColumnType.SELECT,
        selectConfig: {
          options: Object.values(typeOptions),
        },
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (project: ProjectType) => !project.type,
          columnStyle: {
            width: '135px',
          },
        },
        displayValue: (project: ProjectType) => (project.type ? typeOptions[project.type].label : undefined),
      },
      description: {
        label: 'Designação da Obra',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (project: ProjectType) => !project.description,
          columnStyle: {
            width: '200px',
          },
        },
        displayValue: (project: ProjectType) => project.description,
      },
      address: {
        label: 'Localização / Morada',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (project: ProjectType) => !project.address,
          columnStyle: {
            width: '200px',
          },
        },
        displayValue: (project: ProjectType) => project.address,
      },
      client: {
        label: 'Cliente / Promotor',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (project: ProjectType) => !project.client,
          columnStyle: {
            width: '200px',
          },
        },
        displayValue: (project: ProjectType) => project.client,
      },
      contact: {
        label: 'Contacto Cliente',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '200px',
          },
        },
        displayValue: (project: ProjectType) => project.contact,
      },
      isActive: {
        label: 'Activo',
        type: ColumnType.CHECK_BOX,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '70px',
          },
        },
        displayValue: (project: ProjectType) => (project.isActive ? 'Sim' : 'Não'),
      },
    };
  }

  static isValid(project: ProjectType, configs: Configs<ProjectType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(project));
  }
}

export class ProjectWorkCategory {
  static getConfigs(): Configs<ProjectWorkCategoryType> {
    return {
      code: {
        label: 'Cod.',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '40px',
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
      isIncluded: {
        label: 'Inc.?',
        type: ColumnType.CHECK_BOX,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '40px',
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => (workCategory.isIncluded ? 'Sim' : 'Não'),
      },
      description: {
        label: 'Especialidade',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (workCategory: ProjectWorkCategoryType) => !workCategory.description,
          columnStyle: {
            width: '160px',
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => workCategory.description,
      },
      margin: {
        label: 'Margem (%)',
        type: ColumnType.PERCENTAGE,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (workCategory: ProjectWorkCategoryType) =>
            workCategory.isIncluded ? !(workCategory.margin != undefined && workCategory.margin >= 0) : false,
          columnStyle: {
            width: '60px',
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => formatPercentage(workCategory.margin),
      },
      directCost: {
        label: 'Custo Directo (€)',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '90px',
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
      valueWithMargin: {
        label: 'Valor c/ Margem (€)',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '90px',
          },
          classes: {
            'align-right': true,
          },
          headerClasses: {
            'align-right': true,
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => formatCurrency(workCategory.valueWithMargin),
      },
    };
  }

  static isValid(project: ProjectType, configs: Configs<ProjectType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(project));
  }
}

export class ProjectIndirectCost {
  static getConfigs(): Configs<ProjectindirectCostType> {
    return {
      code: {
        label: 'Cod.',
        type: ColumnType.LABEL,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '40px',
          },
          classes: {
            'align-left': true,
          },
          headerClasses: {
            'align-left': true,
          },
        },
        displayValue: (indirectCost: ProjectindirectCostType) => indirectCost.code,
      },
      isIncluded: {
        label: 'Inc?',
        type: ColumnType.CHECK_BOX,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '40px',
          },
        },
        displayValue: (indirectCost: ProjectindirectCostType) => (indirectCost.isIncluded ? 'Sim' : 'Não'),
      },
      description: {
        label: 'Custo Indireto',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (indirectCost: ProjectindirectCostType) => !indirectCost.description,
          columnStyle: {
            width: '160px',
          },
        },
        displayValue: (indirectCost: ProjectindirectCostType) => indirectCost.description,
      },
      value: {
        label: 'Valor (€)',
        type: ColumnType.MONEY,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (indirectCost: ProjectindirectCostType) =>
            indirectCost.isIncluded ? !(indirectCost.value != undefined && indirectCost.value >= 0) : false,
          columnStyle: {
            width: '80px',
          },
        },
        displayValue: (indirectCost: ProjectindirectCostType) => formatCurrency(indirectCost.value),
      },
    };
  }

  static isValid(project: ProjectType, configs: Configs<ProjectType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(project));
  }
}
