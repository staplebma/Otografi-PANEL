import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createVehicleDto: CreateVehicleDto, userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        customer_id: createVehicleDto.customerId,
        brand: createVehicleDto.brand,
        model: createVehicleDto.model,
        year: createVehicleDto.year,
        license_plate: createVehicleDto.licensePlate,
        vin: createVehicleDto.vin,
        color: createVehicleDto.color,
        fuel_type: createVehicleDto.fuelType,
        transmission: createVehicleDto.transmission,
        mileage: createVehicleDto.mileage,
        last_maintenance_date: createVehicleDto.lastMaintenanceDate,
        next_maintenance_date: createVehicleDto.nextMaintenanceDate,
        maintenance_interval_days: createVehicleDto.maintenanceIntervalDays,
        notes: createVehicleDto.notes,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('vehicles')
      .select('*, customers(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('vehicles')
      .select('*, customers(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return data;
  }

  async findByCustomer(customerId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerId);

    if (error) throw error;
    return data;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = {};
    if (updateVehicleDto.customerId)
      updateData.customer_id = updateVehicleDto.customerId;
    if (updateVehicleDto.brand) updateData.brand = updateVehicleDto.brand;
    if (updateVehicleDto.model) updateData.model = updateVehicleDto.model;
    if (updateVehicleDto.year) updateData.year = updateVehicleDto.year;
    if (updateVehicleDto.licensePlate)
      updateData.license_plate = updateVehicleDto.licensePlate;
    if (updateVehicleDto.vin) updateData.vin = updateVehicleDto.vin;
    if (updateVehicleDto.color) updateData.color = updateVehicleDto.color;
    if (updateVehicleDto.fuelType)
      updateData.fuel_type = updateVehicleDto.fuelType;
    if (updateVehicleDto.transmission)
      updateData.transmission = updateVehicleDto.transmission;
    if (updateVehicleDto.mileage !== undefined)
      updateData.mileage = updateVehicleDto.mileage;
    if (updateVehicleDto.lastMaintenanceDate)
      updateData.last_maintenance_date = updateVehicleDto.lastMaintenanceDate;
    if (updateVehicleDto.nextMaintenanceDate)
      updateData.next_maintenance_date = updateVehicleDto.nextMaintenanceDate;
    if (updateVehicleDto.maintenanceIntervalDays)
      updateData.maintenance_interval_days =
        updateVehicleDto.maintenanceIntervalDays;
    if (updateVehicleDto.notes) updateData.notes = updateVehicleDto.notes;

    const { data, error } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return data;
  }

  async updateMaintenanceStatus(id: string, status: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('vehicles')
      .update({ maintenance_status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.from('vehicles').delete().eq('id', id);

    if (error) throw error;

    return { message: 'Vehicle deleted successfully' };
  }

  async getMaintenanceDue() {
    const supabase = this.supabaseService.getClient();

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('vehicles')
      .select('*, customers(*)')
      .lte('next_maintenance_date', today);

    if (error) throw error;
    return data;
  }
}
