import { ColumnType, Configs, EntityType } from '@/types/entity-configs';
import { formatCode, formatCurrency, formatIntNumber, formatNumber, formatPercentage } from '@/utils/validation';
import { UUID } from 'node:crypto';

export interface ProjectType extends EntityType {
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
  isActive?: boolean;
  workCategories?: ProjectWorkCategoryType[];
  totalWithoutTax?: number;
  totalTax?: number;
  totalWithTax?: number;
}

export interface ProjectWorkCategoryType extends EntityType {
  workCategoryId?: UUID;
  isIncluded?: boolean;
  description?: string;
  index?: number;
  code?: number;
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
  code?: number;
  units?: string;
  unitPrice?: number;
  quantity?: number;
  total?: number;
  notes?: string;
  clientTotal?: number;
}

export class Project {
  static getConfigs(): Configs<ProjectType> {
    return {
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
            width: '150px',
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
            width: '80px',
          },
        },
        displayValue: (project: ProjectType) => project.contact,
      },
      landArea: {
        label: 'Área Total Terreno (m²)',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '120px',
          },
          classes: {
            'number-column': true,
          },
          headerClasses: {
            'number-column': true,
          },
        },
        displayValue: (project: ProjectType) => formatNumber(project.landArea),
      },
      implantationArea: {
        label: 'Área Implantação (m²)',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '130px',
          },
          classes: {
            'number-column': true,
          },
          headerClasses: {
            'number-column': true,
          },
        },
        displayValue: (project: ProjectType) => formatNumber(project.implantationArea),
      },
      grossConstructionArea: {
        label: 'Área Bruta Construção (m²)',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '130px',
          },
          classes: {
            'number-column': true,
          },
          headerClasses: {
            'number-column': true,
          },
        },
        displayValue: (project: ProjectType) => formatNumber(project.grossConstructionArea),
      },
      floorsCount: {
        label: 'Nº de Pisos',
        type: ColumnType.INT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '70px',
          },
          classes: {
            'number-column': true,
          },
          headerClasses: {
            'number-column': true,
          },
        },
        displayValue: (project: ProjectType) => formatIntNumber(project.floorsCount),
      },
      ceilingHeight: {
        label: 'Pé-direito Interior (m)',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '120px',
          },
          classes: {
            'number-column': true,
          },
          headerClasses: {
            'number-column': true,
          },
        },
        displayValue: (project: ProjectType) => formatNumber(project.ceilingHeight),
      },
      maxFacadeHeight: {
        label: 'Altura Máx. Fachada (m)',
        type: ColumnType.NUMBER,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '120px',
          },
          classes: {
            'number-column': true,
          },
          headerClasses: {
            'number-column': true,
          },
        },
        displayValue: (project: ProjectType) => formatNumber(project.maxFacadeHeight),
      },
      roomsCount: {
        label: 'Nº de Quartos',
        type: ColumnType.INT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '70px',
          },
          classes: {
            'number-column': true,
          },
          headerClasses: {
            'number-column': true,
          },
        },
        displayValue: (project: ProjectType) => formatIntNumber(project.roomsCount),
      },
      wcCount: {
        label: 'Nº de WCs',
        type: ColumnType.INT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '70px',
          },
          classes: {
            'number-column': true,
          },
          headerClasses: {
            'number-column': true,
          },
        },
        displayValue: (project: ProjectType) => formatIntNumber(project.wcCount),
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
            width: '20px',
          },
        },
        displayValue: (workCategory: ProjectWorkCategoryType) => formatCode(workCategory.code),
      },
      isIncluded: {
        label: 'Incluir?',
        type: ColumnType.CHECK_BOX,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '25px',
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
            width: '200px',
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
            width: '50px',
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
            width: '50px',
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
            width: '50px',
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
