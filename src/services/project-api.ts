import axiosClient from './api';
import { UUID } from 'crypto';
import { ProjectType } from '@/entities/project';

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

  async createProject(project: ProjectType): Promise<void> {
    const payload = {
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
      isActive: project.isActive == undefined ? true : project.isActive,
      workCategories: [],
    };

    await axiosClient.post('/project', payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async updateProject(projectId: UUID, project: ProjectType): Promise<void> {
    const payload = {
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
          customDetail: item.detail,
          customIndex: item.index,
        })),
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
}

export default new ProjectApi();
