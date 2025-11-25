import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SalesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createSaleDto: CreateSaleDto, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error} = await supabase
      .from('sales')
      .insert({
        customer_id: createSaleDto.customerId,
        vehicle_id: createSaleDto.vehicleId,
        sale_date: createSaleDto.saleDate,
        sale_price: createSaleDto.salePrice,
        purchase_price: createSaleDto.purchasePrice,
        payment_method: createSaleDto.paymentMethod,
        status: createSaleDto.status || 'pending',
        notes: createSaleDto.notes,
        sold_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(userRole: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('sales')
      .select('*, customers(*), vehicles(*), users(id, first_name, last_name)')
      .order('created_at', { ascending: false });

    // If not admin or manager, only show user's own sales
    if (userRole !== 'admin' && userRole !== 'manager') {
      query = query.eq('sold_by', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async findOne(id: string, userRole: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('sales')
      .select('*, customers(*), vehicles(*), users(id, first_name, last_name)')
      .eq('id', id);

    // If not admin or manager, only show if user created the sale
    if (userRole !== 'admin' && userRole !== 'manager') {
      query = query.eq('sold_by', userId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return data;
  }

  async update(
    id: string,
    updateSaleDto: UpdateSaleDto,
    userRole: string,
    userId: string,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = {};
    if (updateSaleDto.customerId)
      updateData.customer_id = updateSaleDto.customerId;
    if (updateSaleDto.vehicleId)
      updateData.vehicle_id = updateSaleDto.vehicleId;
    if (updateSaleDto.saleDate) updateData.sale_date = updateSaleDto.saleDate;
    if (updateSaleDto.salePrice)
      updateData.sale_price = updateSaleDto.salePrice;
    if (updateSaleDto.purchasePrice !== undefined)
      updateData.purchase_price = updateSaleDto.purchasePrice;
    if (updateSaleDto.paymentMethod)
      updateData.payment_method = updateSaleDto.paymentMethod;
    if (updateSaleDto.status) updateData.status = updateSaleDto.status;
    if (updateSaleDto.notes) updateData.notes = updateSaleDto.notes;

    let query = supabase.from('sales').update(updateData).eq('id', id);

    // If not admin or manager, only update if user created the sale
    if (userRole !== 'admin' && userRole !== 'manager') {
      query = query.eq('sold_by', userId);
    }

    const { data, error } = await query.select().single();

    if (error || !data) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.from('sales').delete().eq('id', id);

    if (error) throw error;

    return { message: 'Sale deleted successfully' };
  }

  async getStats(userRole: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase.from('sales').select('sale_price, purchase_price, status');

    // If not admin or manager, only show user's own sales
    if (userRole !== 'admin' && userRole !== 'manager') {
      query = query.eq('sold_by', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      totalSales: data?.length || 0,
      completedSales: data?.filter((s) => s.status === 'completed').length || 0,
      pendingSales: data?.filter((s) => s.status === 'pending').length || 0,
      totalRevenue:
        data?.reduce((sum, s) => sum + (Number(s.sale_price) || 0), 0) || 0,
      totalProfit:
        data?.reduce(
          (sum, s) =>
            sum + (Number(s.sale_price) - Number(s.purchase_price || 0)),
          0,
        ) || 0,
    };

    return stats;
  }
}
