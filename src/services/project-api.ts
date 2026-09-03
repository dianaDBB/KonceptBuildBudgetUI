import axiosClient from './api';
import { UUID } from 'crypto';
import { ProjectType } from '@/entities/project';
import { WorkCategoryType } from '@/entities/work-category';
import { IndirectCostType } from '@/entities/indirect-cost';

class ProjectApi {
  async getProjects(): Promise<ProjectType[]> {
    const response = await axiosClient.get('/project', {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  }

  async getProject(projectId: UUID): Promise<ProjectType> {
    const response = await axiosClient.get(`/project/by-id?projectId=${projectId}`, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  }

  async createProject(project: ProjectType): Promise<UUID> {
    const payload = {
      type: project.type,
      description: project.description,
      address: project.address,
      client: project.client,
      contact: project.contact,
      landArea: project.landArea,
      implantationArea: project.implantationArea,
      grossConstructionArea: project.grossConstructionArea,
      floorsCount: project.floorsCount,
      ceilingHeight: project.ceilingHeight,
      maxFacadeHeight: project.maxFacadeHeight,
      roomsCount: project.roomsCount,
      wcCount: project.wcCount,
      tax: project.tax,
      isActive: project.isActive == undefined ? true : project.isActive,
      workCategories: [],
    };

    const response = await axiosClient.post('/project', payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    return response.data;
  }

  async updateProject(projectId: UUID, project: ProjectType): Promise<void> {
    const payload = {
      type: project.type,
      description: project.description,
      address: project.address,
      client: project.client,
      contact: project.contact,
      landArea: project.landArea,
      implantationArea: project.implantationArea,
      grossConstructionArea: project.grossConstructionArea,
      floorsCount: project.floorsCount,
      ceilingHeight: project.ceilingHeight,
      maxFacadeHeight: project.maxFacadeHeight,
      roomsCount: project.roomsCount,
      wcCount: project.wcCount,
      tax: project.tax,
      isActive: project.isActive ?? true,
      workCategories: project.workCategories?.map((category) => ({
        workCategoryId: category.workCategoryId,
        isIncluded: category.isIncluded,
        margin: category.margin,
        customDescription: category.description,
        customIndex: category.index,
        workItems: category.workItems?.map((item) => ({
          workItemId: item.workItemId,
          isIncluded: item.isIncluded,
          customDescription: item.description,
          customIndex: item.index,
          customUnitPrice: item.unitPrice,
          quantity: item.quantity,
          notes: item.notes,
        })),
      })),
      indirectCosts: project.indirectCosts?.map((indirectCost) => ({
        indirectCostId: indirectCost.indirectCostId,
        isIncluded: indirectCost.isIncluded,
        customValue: indirectCost.value,
        customDescription: indirectCost.description,
        customIndex: indirectCost.index,
      })),
    };

    await axiosClient.put(`/project?projectId=${projectId}`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async deleteProject(projectId: UUID): Promise<void> {
    await axiosClient.delete(`/project?projectId=${projectId}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async getNewWorkCategoriesAndItems(projectId: UUID): Promise<WorkCategoryType[]> {
    const response = await axiosClient.get(`/project/new-work-categories?projectId=${projectId}`, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  }

  async getNewindirectCosts(projectId: UUID): Promise<IndirectCostType[]> {
    const response = await axiosClient.get(`/project/new-indirect-costs?projectId=${projectId}`, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  }

  async exportToExcel(projectId: UUID): Promise<Blob> {
    const response = await axiosClient.get(`/project/export-excel?projectId=${projectId}`, {
      headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      responseType: 'blob',
    });

    return response.data;
  }
}

export default new ProjectApi();
