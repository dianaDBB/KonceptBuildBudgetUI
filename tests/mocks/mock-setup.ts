import { Page } from '@playwright/test';

export class MockSetup {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async setMockMode() {
    // Abort all API calls by default
    await this.page.route('**localhost**', (route) => {
      // TODO : change this to have a url keyword (for example budget or konceptbuild)
      route.abort();
    });
  }
}
