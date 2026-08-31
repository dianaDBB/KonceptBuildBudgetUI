import { WorkCategoryType } from '@/entities/work-category';
import axiosClient from './api';
import { UUID } from 'crypto';
import { WorkItemType } from '@/entities/work-item';

class WorkCategoryApi {
  async getWorkCategories(): Promise<WorkCategoryType[]> {
    const response = await axiosClient.get('/work-category', {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  }

  async createWorkCategory(workCategory: WorkCategoryType): Promise<void> {
    const payload = {
      index: workCategory.index,
      description: workCategory.description,
      isActive: workCategory.isActive,
    };

    await axiosClient.post('/work-category', payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async updateWorkCategory(workCategoryId: UUID, workCategory: WorkCategoryType): Promise<void> {
    const payload = {
      index: workCategory.index,
      description: workCategory.description,
      isActive: workCategory.isActive,
    };

    await axiosClient.put(`/work-category?workCategoryId=${workCategoryId}`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async deleteWorkCategory(workCategoryId: UUID): Promise<void> {
    await axiosClient.delete(`/work-category?workCategoryId=${workCategoryId}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async createWorkItem(workCategoryId: UUID, workItem: WorkItemType): Promise<void> {
    const payload = {
      index: workItem.index,
      description: workItem.description,
      units: workItem.units,
      unitPrice: workItem.unitPrice,
      isActive: workItem.isActive,
    };

    await axiosClient.post(`/work-category/work-item?workCategoryId=${workCategoryId}`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async updateWorkItem(workCategoryId: UUID, workItemId: UUID, workItem: WorkItemType): Promise<void> {
    const payload = {
      index: workItem.index,
      description: workItem.description,
      units: workItem.units,
      unitPrice: workItem.unitPrice,
      isActive: workItem.isActive,
    };

    await axiosClient.put(
      `/work-category/work-item?workCategoryId=${workCategoryId}&workItemId=${workItemId}`,
      payload,
      {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      },
    );
  }

  async deleteWorkItem(workCategoryId: UUID, workItemId: UUID): Promise<void> {
    await axiosClient.delete(`/work-category/work-item?workCategoryId=${workCategoryId}&workItemId=${workItemId}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async reorderWorkCategories(workCategoryIds: string[]): Promise<void> {
    const payload = {
      workCategoriesIds: workCategoryIds,
    };

    await axiosClient.put(`/work-category/reorder`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async reorderWorkItems(workCategoryId: UUID, workItemIds: string[]): Promise<void> {
    const payload = {
      workItemsIds: workItemIds,
    };

    await axiosClient.put(`/work-category/work-item/reorder?workCategoryId=${workCategoryId}`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }
}

export default new WorkCategoryApi();
