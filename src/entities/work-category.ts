import { ColumnType, Configs, EntityType } from '@/types/entity-configs';
import { WorkItemType } from './work-item';
import { formatIntNumber } from '@/utils/validation';

export interface WorkCategoryType extends EntityType {
  defaultIndex?: number;
  description?: string;
  isActive?: boolean;
  workItems?: WorkItemType[];
}

export class WorkCategory {
  static getConfigs(): Configs<WorkCategoryType> {
    return {
      defaultIndex: {
        label: 'Index',
        type: ColumnType.INT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (workCategory: WorkCategoryType) => !workCategory.defaultIndex,
          isHighlight: false,
          columnStyle: {
            width: '50px',
          },
        },
        displayValue: (workCategory: WorkCategoryType) => formatIntNumber(workCategory.defaultIndex),
      },
      description: {
        label: 'Descrição',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (workCategory: WorkCategoryType) => !workCategory.description,
          columnStyle: {
            width: '200px',
          },
        },
        displayValue: (workCategory: WorkCategoryType) => workCategory.description,
      },
      detail: {
        label: 'Detalhes',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => true,
          isInvalid: () => false,
          columnStyle: {
            width: '200px',
          },
        },
        displayValue: () => '---',
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
        displayValue: (workCategory: WorkCategoryType) => (workCategory.isActive ? 'Sim' : 'Não'),
      },
    };
  }

  static isValid(workCategory: WorkCategoryType, configs: Configs<WorkCategoryType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(workCategory));
  }
}
