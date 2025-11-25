import api from './api';


export const salesService = {
  async getAll(): Promise<Sale[]> {
    const response = await api.get<Sale[]>('/sales');
    return response.data;
  },

  async getById(id: string): Promise<Sale> {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  async getStats(): Promise<SalesStats> {
    const response = await api.get<SalesStats>('/sales/stats');
    return response.data;
  },

  async create(data: Partial<Sale>): Promise<Sale> {
    const response = await api.post<Sale>('/sales', data);
    return response.data;
  },

  async update(id: string, data: Partial<Sale>): Promise<Sale> {
    const response = await api.patch<Sale>(`/sales/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/sales/${id}`);
  },
};
