import api from './api';
import { isDemoMode, getDemoCustomers, saveDemoCustomers } from './demo';

export const customersService = {
  async getAll(params?: any): Promise<Customer[]> {
    if (isDemoMode()) {
      return getDemoCustomers();
    }
    const response = await api.get<any>('/customers', { params });
    return Array.isArray(response.data) ? response.data : response.data.data;
  },

  async getById(id: string): Promise<Customer> {
    if (isDemoMode()) {
      const customers = getDemoCustomers();
      const customer = customers.find((c: any) => c.id === id);
      if (!customer) throw new Error('Customer not found');
      return customer;
    }
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  async search(query: string): Promise<Customer[]> {
    if (isDemoMode()) {
      const customers = getDemoCustomers();
      const lowerQuery = query.toLowerCase();
      return customers.filter((c: any) =>
        c.first_name.toLowerCase().includes(lowerQuery) ||
        c.last_name.toLowerCase().includes(lowerQuery) ||
        c.phone.includes(query) ||
        (c.email && c.email.toLowerCase().includes(lowerQuery)) ||
        (c.city && c.city.toLowerCase().includes(lowerQuery))
      );
    }
    const response = await api.get<Customer[]>(`/customers/search?q=${query}`);
    return response.data;
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    if (isDemoMode()) {
      const customers = getDemoCustomers();
      const newCustomer = {
        id: 'demo-customer-' + Date.now(),
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        notes: data.notes || '',
        created_by: 'demo-user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedCustomers = [...customers, newCustomer];
      saveDemoCustomers(updatedCustomers);
      return newCustomer;
    }
    // Backend expects camelCase format
    const requestData = {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      notes: data.notes,
    };
    const response = await api.post<Customer>('/customers', requestData);
    return response.data;
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    if (isDemoMode()) {
      const customers = getDemoCustomers();
      const index = customers.findIndex((c: any) => c.id === id);
      if (index === -1) throw new Error('Customer not found');

      const updatedCustomer = {
        ...customers[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      customers[index] = updatedCustomer;
      saveDemoCustomers(customers);
      return updatedCustomer;
    }
    // Backend expects camelCase format
    const requestData: any = {};
    if (data.first_name !== undefined) requestData.firstName = data.first_name;
    if (data.last_name !== undefined) requestData.lastName = data.last_name;
    if (data.email !== undefined) requestData.email = data.email;
    if (data.phone !== undefined) requestData.phone = data.phone;
    if (data.address !== undefined) requestData.address = data.address;
    if (data.city !== undefined) requestData.city = data.city;
    if (data.notes !== undefined) requestData.notes = data.notes;
    const response = await api.patch<Customer>(`/customers/${id}`, requestData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      const customers = getDemoCustomers();
      const filtered = customers.filter((c: any) => c.id !== id);
      saveDemoCustomers(filtered);
      return;
    }
    await api.delete(`/customers/${id}`);
  },
};
