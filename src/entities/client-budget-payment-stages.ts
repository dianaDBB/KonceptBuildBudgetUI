import { ColumnType, Configs } from '@/types/entity-configs';
import { formatIntNumber, formatPercentage } from '@/utils/validation';
import { ProjectPaymentStagesType } from './project';

export class ClientBudgetPaymentStages {
  static getConfigs(): Configs<ProjectPaymentStagesType> {
    return {
      auto: {
        label: 'Auto',
        type: ColumnType.INT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (paymentStage: ProjectPaymentStagesType) => !paymentStage.auto,
          isHighlight: true,
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
        displayValue: (paymentStage: ProjectPaymentStagesType) => formatIntNumber(paymentStage.auto),
      },
      description: {
        label: 'Descrição',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (paymentStage: ProjectPaymentStagesType) => !paymentStage.description,
          isHighlight: false,
          columnStyle: {
            width: '300px',
          },
          classes: {
            'align-left': true,
          },
          headerClasses: {
            'align-left': true,
          },
        },
        displayValue: (paymentStage: ProjectPaymentStagesType) => paymentStage.description,
      },
      percentage: {
        label: 'Percentagem (%)',
        type: ColumnType.PERCENTAGE,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (paymentStage: ProjectPaymentStagesType) => !paymentStage.percentage,
          isHighlight: false,
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
        displayValue: (paymentStage: ProjectPaymentStagesType) => formatPercentage(paymentStage.percentage),
      },
      conditions: {
        label: 'Condições de Pagamento',
        type: ColumnType.TEXT,
        styleConfig: {
          showDisabled: () => false,
          isInvalid: (paymentStage: ProjectPaymentStagesType) => !paymentStage.conditions,
          isHighlight: false,
          columnStyle: {
            width: '300px',
          },
          classes: {
            'align-left': true,
          },
          headerClasses: {
            'align-left': true,
          },
        },
        displayValue: (paymentStage: ProjectPaymentStagesType) => paymentStage.conditions,
      },
    };
  }

  static isValid(paymentStage: ProjectPaymentStagesType, configs: Configs<ProjectPaymentStagesType>): boolean {
    return Object.values(configs).every((config) => !config.styleConfig.isInvalid(paymentStage));
  }
}
