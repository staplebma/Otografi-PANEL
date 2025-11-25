import api from './api';

export const vehiclesService = {
  async getAll(): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>('/vehicles');
    return response.data;
  },

  async getById(id: string): Promise<Vehicle> {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  async getByCustomer(customerId: string): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>(`/vehicles/customer/${customerId}`);
    return response.data;
  },

  async getMaintenanceDue(): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>('/vehicles/maintenance-due');
    return response.data;
  },

  async create(data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.post<Vehicle>('/vehicles', data);
    return response.data;
  },

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.patch<Vehicle>(`/vehicles/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },
};
