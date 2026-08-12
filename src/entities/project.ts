import { ColumnType, Configs, EntityType } from '@/types/entity-configs';
import { WorkItemType } from './work-item';
import { WorkCategoryType } from './work-category';
import { formatIntNumber, formatNumber } from '@/utils/validation';

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
  workCategories?: {
    workCategory?: WorkCategoryType;
    isIncluded?: boolean;
    workItems?: {
      workItem?: WorkItemType;
      isIncluded?: boolean;
      customDescription?: string;
    }[];
  }[];
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
        label: 'Contacto do Cliente',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: () => false,
          columnStyle: {
            width: '100px',
          },
        },
        displayValue: (project: ProjectType) => project.contact,
      },
      landArea: {
        label: 'Área Total do Terreno (m²)',
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
        displayValue: (project: ProjectType) => formatNumber(project.landArea),
      },
      implantationArea: {
        label: 'Área de Implantação (m²)',
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
        label: 'Área Bruta de Construção (m²)',
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
            width: '80px',
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
            width: '130px',
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
            width: '130px',
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
            width: '80px',
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
            width: '80px',
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
            width: '80px',
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
