import { Configs, EntityType } from '@/types/entity-configs';
import { WorkCategory } from './work-category';
import { formatSubCode } from '@/utils/validation';

export interface WorkItemType extends EntityType {
  index?: number;
  code?: number;
  description?: string;
  units?: string;
  unitPrice?: number;
  isActive?: boolean;
}

export class WorkItem {
  static getConfigs(): Configs<WorkItemType> {
    const workCategoryConfigs = WorkCategory.getConfigs();

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
    ) as Configs<WorkItemType>;

    return {
      ...workItemConfigs,
      code: {
        ...workItemConfigs.code,
        styleConfig: {
          ...workItemConfigs.code.styleConfig,
          showDisabled: () => true,
          isInvalid: () => false,
        },
        displayValue: (workItem: WorkItemType) => formatSubCode(workItem.code),
      },
      description: {
        ...workItemConfigs.description,
        styleConfig: {
          ...workItemConfigs.description.styleConfig,
          showDisabled: () => false,
          isInvalid: (workItem: WorkItemType) => !workItem.description,
        },
        displayValue: (workItem: WorkItemType) => workItem.description,
      },
      units: {
        ...workItemConfigs.units,
        styleConfig: {
          ...workItemConfigs.units.styleConfig,
          showDisabled: () => false,
          isInvalid: (workItem: WorkItemType) => !workItem.units,
        },
        displayValue: (workItem: WorkItemType) => workItem.units,
      },
      unitPrice: {
        ...workItemConfigs.unitPrice,
        styleConfig: {
          ...workItemConfigs.unitPrice.styleConfig,
          showDisabled: () => false,
          isInvalid: (workItem: WorkItemType) => !workItem.unitPrice,
        },
        displayValue: (workItem: WorkItemType) => workItem.unitPrice,
      },
      isActive: {
        ...workItemConfigs.isActive,
        styleConfig: {
          ...workItemConfigs.isActive.styleConfig,
          showDisabled: () => false,
          isInvalid: () => false,
        },
        displayValue: (workItem: WorkItemType) => (workItem.isActive ? 'Sim' : 'Não'),
      },
    };
  }

  static isValid(workItem: WorkItemType, configs: Configs<WorkItemType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(workItem));
  }
}
