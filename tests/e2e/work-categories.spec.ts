import { test, expect } from '@fixtures';
import { WorkCategoryType } from 'src/entities/work-category';

test.describe('Work categories list', () => {
  test('Check work categories table', async ({ workCategoriesPage }) => {
    await test.step('Open the "Work Categories" page', async () => {
      await workCategoriesPage.goTo();
    });

    await test.step('Check table is present', async () => {
      await expect(workCategoriesPage.locators.table.header.row()).toBeVisible();
      await expect(workCategoriesPage.locators.table.header.th.byIndex(0)).toBeVisible();
      await expect(workCategoriesPage.locators.table.header.th.byIndex(1)).toBeVisible();
      await expect(workCategoriesPage.locators.table.header.th.byIndex(2)).toHaveText('Index');
      await expect(workCategoriesPage.locators.table.header.th.byIndex(3)).toHaveText('Descrição');
      await expect(workCategoriesPage.locators.table.header.th.byIndex(4)).toHaveText('Un.');
      await expect(workCategoriesPage.locators.table.header.th.byIndex(5)).toHaveText('Preço Un.');
      await expect(workCategoriesPage.locators.table.header.th.byIndex(6)).toHaveText('Activo');
      await expect(workCategoriesPage.locators.table.header.th.byIndex(7)).toBeVisible();
    });
  });

  test('Check work categories API', async ({ workCategoriesApi }) => {
    let workCategories: WorkCategoryType[] = [];

    await test.step('Execute GET work categories endpoint', async () => {
      workCategories = await workCategoriesApi.getAllWorkCategories();
    });

    await test.step('Check response', async () => {
      expect(workCategories.length).toBeGreaterThanOrEqual(1);
    });
  });
});
