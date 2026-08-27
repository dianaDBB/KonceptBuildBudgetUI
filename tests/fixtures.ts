import { test as base, expect, Locator } from '@playwright/test';
import { MockSetup } from '@mocks/mock-setup';
import { BaseApi } from '@apis/base.api';
import { BasePage } from '@pages/base.page';
import { WorkCategoriesPage } from '@pages/work-categories.page';
import { LoginPage } from '@pages/login.page';
import { WorkCategoriesApi } from '@apis/work-categories.api';

export interface BaseFixtures {
  mockSetup: MockSetup;
  baseApi: BaseApi;
  basePage: BasePage;

  loginPage: LoginPage;
  workCategoriesPage: WorkCategoriesPage;

  workCategoriesApi: WorkCategoriesApi;
}

export const test = base.extend<BaseFixtures>({
  mockSetup: async ({ page }, use) => {
    const mockSetup = new MockSetup(page);
    await use(mockSetup);
  },

  baseApi: async ({ request }, use) => {
    const baseApi = new BaseApi(request);
    await use(baseApi);
  },

  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  workCategoriesPage: async ({ page }, use) => {
    const workCategoriesPage = new WorkCategoriesPage(page);
    await use(workCategoriesPage);
  },

  workCategoriesApi: async ({ request }, use) => {
    const workCategoriesApi = new WorkCategoriesApi(request);
    await use(workCategoriesApi);
  },
});

expect.extend({
  async toHaveCountGreaterThanOrEqual(locator: Locator, expected: number, options?: { timeout?: number }) {
    const assertionName = 'toHaveCountGreaterThanOrEqual';
    let pass: boolean;
    let received: number | undefined;

    try {
      await expect(async () => {
        received = await locator.count();
        expect(received).toBeGreaterThanOrEqual(expected);
      }).toPass({ timeout: options?.timeout || 5000 });
      pass = true;
    } catch (e: unknown) {
      pass = false;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: >= ${this.isNot ? 'not' : ''}${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`
      : () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: >= ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`;

    return { message, pass, name: assertionName, expected, actual: received };
  },

  async toHaveCountGreaterThan(locator: Locator, expected: number, options?: { timeout?: number }) {
    const assertionName = 'toHaveCountGreaterThan';
    let pass: boolean;
    let received: number | undefined;

    try {
      await expect(async () => {
        received = await locator.count();
        expect(received).toBeGreaterThan(expected);
      }).toPass({ timeout: options?.timeout || 5000 });
      pass = true;
    } catch (e: unknown) {
      pass = false;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: > ${this.isNot ? 'not' : ''}${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`
      : () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: > ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`;

    return { message, pass, name: assertionName, expected, actual: received };
  },

  async toHaveCountLessThanOrEqual(locator: Locator, expected: number, options?: { timeout?: number }) {
    const assertionName = 'toHaveCountLessThanOrEqual';
    let pass: boolean;
    let received: number | undefined;

    try {
      await expect(async () => {
        received = await locator.count();
        expect(received).toBeLessThanOrEqual(expected);
      }).toPass({ timeout: options?.timeout || 5000 });
      pass = true;
    } catch (e: unknown) {
      pass = false;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: <= ${this.isNot ? 'not' : ''}${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`
      : () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: <= ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`;

    return { message, pass, name: assertionName, expected, actual: received };
  },

  async toHaveCountLessThan(locator: Locator, expected: number, options?: { timeout?: number }) {
    const assertionName = 'toHaveCountLessThan';
    let pass: boolean;
    let received: number | undefined;

    try {
      await expect(async () => {
        received = await locator.count();
        expect(received).toBeLessThan(expected);
      }).toPass({ timeout: options?.timeout || 5000 });
      pass = true;
    } catch (e: unknown) {
      pass = false;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: < ${this.isNot ? 'not' : ''}${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`
      : () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: < ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`;

    return { message, pass, name: assertionName, expected, actual: received };
  },
});

export { expect } from '@playwright/test';
export type { Page, Locator, APIRequestContext, Request, Response } from '@playwright/test';
