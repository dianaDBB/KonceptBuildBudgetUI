import { expect, test } from '@fixtures';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '../.auth/user.json');

test.describe('Setup', () => {
  test('Login', async ({ loginPage }) => {
    await loginPage.goTo();
    await expect(loginPage.locators.section()).toBeVisible();
    await loginPage.locators.form.username().fill('admin');
    await loginPage.locators.form.password().fill(process.env.PASSWORD || '');
    await loginPage.locators.form.signInButton().click();

    await loginPage.page.waitForURL('/project/list');
    await loginPage.page.context().storageState({ path: authFile });
  });
});
