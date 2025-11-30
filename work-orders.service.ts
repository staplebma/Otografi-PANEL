import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Injectable()
export class WorkOrdersService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createWorkOrderDto: CreateWorkOrderDto, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Create work order
    const { data: workOrder, error: woError } = await supabase
      .from('work_orders')
      .insert({
        vehicle_id: createWorkOrderDto.vehicleId,
        service_date: createWorkOrderDto.serviceDate,
        status: createWorkOrderDto.status || 'pending',
        notes: createWorkOrderDto.notes,
        created_by: userId,
      })
      .select()
      .single();

    if (woError) throw woError;

    // Create parts
    const partsData = createWorkOrderDto.parts.map((part) => ({
      work_order_id: workOrder.id,
      name: part.name,
      code: part.code,
      given_date: part.givenDate,
      expiration_date: part.expirationDate,
      price: part.price,
      profit: part.profit,
    }));

    const { error: partsError } = await supabase
      .from('work_order_parts')
      .insert(partsData);

    if (partsError) throw partsError;

    // Fetch complete work order with parts
    return this.findOne(workOrder.id, userId, 'admin');
  }

  async findAll(userId: string, userRole: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('work_orders')
      .select(
        `
        *,
        vehicles!inner(
          *,
          customers(*)
        ),
        work_order_parts(*)
      `,
      )
      .order('created_at', { ascending: false });

    // If not admin or manager, only show user's own work orders
    if (userRole !== 'admin' && userRole !== 'manager') {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate totals for each work order
    return data.map((wo) => ({
      ...wo,
      parts: wo.work_order_parts,
      total_price: wo.work_order_parts?.reduce(
        (sum, p) => sum + (Number(p.price) || 0),
        0,
      ),
      total_profit: wo.work_order_parts?.reduce(
        (sum, p) => sum + (Number(p.profit) || 0),
        0,
      ),
    }));
  }

  async findOne(id: string, userId: string, userRole: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('work_orders')
      .select(
        `
        *,
        vehicles!inner(
          *,
          customers(*)
        ),
        work_order_parts(*)
      `,
      )
      .eq('id', id);

    if (userRole !== 'admin' && userRole !== 'manager') {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return {
      ...data,
      parts: data.work_order_parts,
      total_price: data.work_order_parts?.reduce(
        (sum, p) => sum + (Number(p.price) || 0),
        0,
      ),
      total_profit: data.work_order_parts?.reduce(
        (sum, p) => sum + (Number(p.profit) || 0),
        0,
      ),
    };
  }

  async update(
    id: string,
    updateWorkOrderDto: UpdateWorkOrderDto,
    userId: string,
    userRole: string,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = {};
    if (updateWorkOrderDto.vehicleId)
      updateData.vehicle_id = updateWorkOrderDto.vehicleId;
    if (updateWorkOrderDto.serviceDate)
      updateData.service_date = updateWorkOrderDto.serviceDate;
    if (updateWorkOrderDto.status) updateData.status = updateWorkOrderDto.status;
    if (updateWorkOrderDto.notes !== undefined)
      updateData.notes = updateWorkOrderDto.notes;

    let query = supabase.from('work_orders').update(updateData).eq('id', id);

    if (userRole !== 'admin' && userRole !== 'manager') {
      query = query.eq('created_by', userId);
    }

    const { error } = await query;

    if (error) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    // Update parts if provided
    if (updateWorkOrderDto.parts) {
      // Delete existing parts
      await supabase.from('work_order_parts').delete().eq('work_order_id', id);

      // Insert new parts
      const partsData = updateWorkOrderDto.parts.map((part) => ({
        work_order_id: id,
        name: part.name,
        code: part.code,
        given_date: part.givenDate,
        expiration_date: part.expirationDate,
        price: part.price,
        profit: part.profit,
      }));

      await supabase.from('work_order_parts').insert(partsData);
    }

    return this.findOne(id, userId, userRole);
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.from('work_orders').delete().eq('id', id);

    if (error) throw error;

    return { message: 'Work order deleted successfully' };
  }

  async getStats(userId: string, userRole: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase.from('work_orders').select(
      `
      status,
      work_order_parts(price, profit)
    `,
    );

    if (userRole !== 'admin' && userRole !== 'manager') {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      totalWorkOrders: data?.length || 0,
      pendingWorkOrders:
        data?.filter((wo) => wo.status === 'pending').length || 0,
      inProgressWorkOrders:
        data?.filter((wo) => wo.status === 'in_progress').length || 0,
      completedWorkOrders:
        data?.filter((wo) => wo.status === 'completed').length || 0,
      totalRevenue: 0,
      totalProfit: 0,
    };

    // Calculate totals
    data?.forEach((wo) => {
      wo.work_order_parts?.forEach((part) => {
        stats.totalRevenue += Number(part.price) || 0;
        stats.totalProfit += Number(part.profit) || 0;
      });
    });

    return stats;
  }
}
