import { APIRequestContext } from '@fixtures';
import { BaseApi } from './base.api';
import { WorkCategoryType } from 'src/entities/work-category';

export class WorkCategoriesApi extends BaseApi {
  constructor(public readonly request: APIRequestContext, public readonly envFileName?: string) {
    super(request, envFileName);
  }

  /************************************************************************************************************* URLs */

  static getAllUrl(): string {
    return `${this.baseUrl()}/work-category`;
  }

  /********************************************************************************************************** ACTIONS */

  async getAllWorkCategories(): Promise<WorkCategoryType[]> {
    const url = WorkCategoriesApi.getAllUrl();

    const response = await this.executeValidatedGet(url);
    await this.checkRequestStatus(response, 200);

    return response.json();
  }
}
