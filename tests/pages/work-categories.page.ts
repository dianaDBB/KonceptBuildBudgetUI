import { expect, Page } from '@fixtures';
import { BasePage } from './base.page';

export class WorkCategoriesPage extends BasePage {
  constructor(public page: Page) {
    super(page);
  }

  locators = {
    section: () => {
      return this.getLocatorSource().getByTestId('work-categories');
    },
    header: {
      section: () => {
        return this.locators.section().getByTestId('header');
      },
      text: () => {
        return this.locators.header.section().locator('h3');
      },
      goToProjectList: () => {
        return this.locators.header.section().locator('RouterLink');
      },
    },
    table: {
      section: () => {
        return this.locators.section().locator('table');
      },
      header: {
        row: () => {
          return this.locators.table.section().locator('thead');
        },
        th: {
          all: () => {
            return this.locators.table.header.row().locator('th');
          },
          byIndex: (index: number) => {
            return this.locators.table.header.th.all().nth(index);
          },
          byText: (header: string) => {
            return this.locators.table.header.th.all().filter({ hasText: header });
          },
        },
      },
    },
  };

  async goTo(): Promise<void> {
    await this.page.goto('/configs/work-categories');
    await expect(this.locators.section()).toBeVisible();
    await expect(this.locators.header.section()).toBeVisible();
    await expect(this.locators.table.section()).toBeVisible();
    await expect(this.locators.table.header.th.all()).toHaveCountGreaterThanOrEqual(1);
  }
}
