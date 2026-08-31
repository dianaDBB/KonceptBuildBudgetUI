import axiosClient from './api';
import { UUID } from 'crypto';
import { IndirectCostType } from '@/entities/indirect-cost';

class IndirectCostApi {
  async getIndirectCosts(): Promise<IndirectCostType[]> {
    const response = await axiosClient.get('/indirect-cost', {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  }

  async createIndirectCosts(indirectCost: IndirectCostType): Promise<void> {
    const payload = {
      index: indirectCost.index,
      description: indirectCost.description,
      value: indirectCost.value,
      isActive: indirectCost.isActive,
    };

    await axiosClient.post('/indirect-cost', payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async updateIndirectCost(indirectCostId: UUID, indirectCost: IndirectCostType): Promise<void> {
    const payload = {
      index: indirectCost.index,
      description: indirectCost.description,
      value: indirectCost.value,
      isActive: indirectCost.isActive,
    };

    await axiosClient.put(`/indirect-cost?indirectCostId=${indirectCostId}`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async deleteIndirectCost(indirectCostId: UUID): Promise<void> {
    await axiosClient.delete(`/indirect-cost?indirectCostId=${indirectCostId}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  async reorderIndirectCosts(indirectCostIds: string[]): Promise<void> {
    const payload = {
      indirectCostsIds: indirectCostIds,
    };

    await axiosClient.put(`/indirect-cost/reorder`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }
}

export default new IndirectCostApi();
