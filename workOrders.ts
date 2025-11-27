import api from './api';
import { WorkOrder, WorkOrderStats } from '../types';

export const workOrdersService = {
  async getAll(): Promise<WorkOrder[]> {
    const response = await api.get<WorkOrder[]>('/work-orders');
    return response.data;
  },

  async getOne(id: string): Promise<WorkOrder> {
    const response = await api.get<WorkOrder>(`/work-orders/${id}`);
    return response.data;
  },

  async create(data: Partial<WorkOrder>): Promise<WorkOrder> {
    // Transform data to match backend DTO
    const payload = {
      vehicleId: data.vehicle_id,
      serviceDate: data.service_date,
      status: data.status || 'pending',
      notes: data.notes || '',
      parts: data.parts?.map(part => ({
        name: part.name,
        code: part.code,
        givenDate: part.given_date,
        expirationDate: part.expiration_date,
        price: part.price,
        profit: part.profit,
      })) || [],
    };

    const response = await api.post<WorkOrder>('/work-orders', payload);
    return response.data;
  },

  async update(id: string, data: Partial<WorkOrder>): Promise<WorkOrder> {
    // Transform data to match backend DTO
    const payload: any = {};
    if (data.vehicle_id) payload.vehicleId = data.vehicle_id;
    if (data.service_date) payload.serviceDate = data.service_date;
    if (data.status) payload.status = data.status;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.parts) {
      payload.parts = data.parts.map(part => ({
        name: part.name,
        code: part.code,
        givenDate: part.given_date,
        expirationDate: part.expiration_date,
        price: part.price,
        profit: part.profit,
      }));
    }

    const response = await api.patch<WorkOrder>(`/work-orders/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/work-orders/${id}`);
  },

  async getStats(): Promise<WorkOrderStats> {
    const response = await api.get<WorkOrderStats>('/work-orders/stats');
    return response.data;
  },
};
