import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetCustomersDto, SortBy } from './dto/get-customers.dto';

@Injectable()
export class CustomersService {
  constructor(private supabaseService: SupabaseService) { }

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('customers')
      .insert({
        first_name: createCustomerDto.firstName,
        last_name: createCustomerDto.lastName,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        address: createCustomerDto.address,
        city: createCustomerDto.city,
        notes: createCustomerDto.notes,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(user: any, queryParams: GetCustomersDto) {
    const { page = 1, limit = 10, search, sortBy } = queryParams;
    const supabase = this.supabaseService.getClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let data: any[] = [];
    let count: number | null = 0;
    let error: any;

    if (sortBy === SortBy.MAINTENANCE_DUE) {
      // Sort by maintenance due date (from vehicles table)
      let query = supabase
        .from('vehicles')
        .select(`
          next_maintenance_date,
          customer:customers!inner(id, first_name, last_name, email, phone, city, created_at)
        `, { count: 'exact' })
        .order('next_maintenance_date', { ascending: true });

      if (user.role !== 'admin') {
        query = query.eq('customer.created_by', user.id);
      }

      if (search) {
        // Search is tricky with join, skipping for now or need complex filter
      }

      const result = await query.range(from, to);

      if (result.error) throw result.error;

      // Map to flat structure
      data = (result.data || []).map((v: any) => ({
        ...v.customer,
        next_maintenance_date: v.next_maintenance_date
      }));
      count = result.count;

    } else {
      // Standard query
      let query = supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone, city, created_at', { count: 'exact' });

      if (user.role !== 'admin') {
        query = query.eq('created_by', user.id);
      }

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      // Default sort
      query = query.order('created_at', { ascending: false });

      const result = await query.range(from, to);
      data = result.data || [];
      error = result.error;
      count = result.count;
    }

    if (error) throw error;

    return {
      data,
      meta: {
        total: count,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    };
  }

  async findAllWithVehicles(user: any) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone, city, created_at, vehicles(id, make, model, year, plate_number)')
      .order('created_at', { ascending: false });

    if (user.role !== 'admin') {
      query = query.eq('created_by', user.id);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return data;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('customers')
      .update({
        first_name: updateCustomerDto.firstName,
        last_name: updateCustomerDto.lastName,
        email: updateCustomerDto.email,
        phone: updateCustomerDto.phone,
        address: updateCustomerDto.address,
        city: updateCustomerDto.city,
        notes: updateCustomerDto.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) throw error;

    return { message: 'Customer deleted successfully' };
  }

  async bulkRemove(ids: string[]) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.from('customers').delete().in('id', ids);

    if (error) throw error;

    return { message: `${ids.length} customers deleted successfully` };
  }

  async search(query: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`,
      );

    if (error) throw error;
    return data;
  }
}
