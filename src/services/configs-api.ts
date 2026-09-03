import { TypeEnum } from '@/types/type-enum';
import axiosClient from './api';

class ConfigsApi {
  async getTypeValues(): Promise<TypeEnum[]> {
    const response = await axiosClient.get('/configs/type', {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  }
}

export default new ConfigsApi();
