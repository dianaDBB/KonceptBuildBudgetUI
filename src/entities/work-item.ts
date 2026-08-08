import { Configs, EntityType } from '@/types/entity-configs';
import { WorkCategory } from './work-category';

export interface WorkItemType extends EntityType {
  defaultIndex?: number;
  description?: string;
  detail?: string;
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
      defaultIndex: {
        ...workItemConfigs.defaultIndex,
        styleConfig: {
          ...workItemConfigs.defaultIndex.styleConfig,
          showDisabled: () => false,
          isInvalid: (workItem: WorkItemType) => !workItem.defaultIndex,
        },
        displayValue: (workItem: WorkItemType) => workItem.defaultIndex,
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
      detail: {
        ...workItemConfigs.detail,
        styleConfig: {
          ...workItemConfigs.detail.styleConfig,
          showDisabled: () => false,
          isInvalid: (workItem: WorkItemType) => !workItem.detail,
        },
        displayValue: (workItem: WorkItemType) => workItem.detail,
      },
      isActive: {
        ...workItemConfigs.isActive,
        styleConfig: {
          ...workItemConfigs.isActive.styleConfig,
          showDisabled: () => false,
          isInvalid: (workItem: WorkItemType) => !workItem.isActive,
        },
        displayValue: (workItem: WorkItemType) => (workItem.isActive ? 'Sim' : 'Não'),
      },
    };
  }

  static isValid(workItem: WorkItemType, configs: Configs<WorkItemType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(workItem));
  }
}
