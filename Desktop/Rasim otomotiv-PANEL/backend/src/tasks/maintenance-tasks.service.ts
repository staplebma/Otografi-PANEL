import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SmsService } from '../sms/sms.service';
import { PartsService } from '../parts/parts.service';

@Injectable()
export class MaintenanceTasksService {
  private readonly logger = new Logger(MaintenanceTasksService.name);

  constructor(
    private supabaseService: SupabaseService,
    private notificationsService: NotificationsService,
    private smsService: SmsService,
    private partsService: PartsService,
  ) { }

  // Run every day at 8:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkPartsExpiration() {
    this.logger.log('Starting parts expiration check...');
    await this.partsService.sendExpirationAlerts();
    this.logger.log('Parts expiration check completed');
  }

  // Run every day at 9:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkMaintenanceDue() {
    this.logger.log('Starting maintenance check...');

    const supabase = this.supabaseService.getClient();
    const today = new Date();

    // Get all vehicles with next_maintenance_date
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*, customers(*)')
      .not('next_maintenance_date', 'is', null);

    if (error) {
      this.logger.error('Error fetching vehicles:', error);
      return;
    }

    if (!vehicles || vehicles.length === 0) {
      this.logger.log('No vehicles with maintenance dates found');
      return;
    }

    for (const vehicle of vehicles) {
      const nextMaintenanceDate = new Date(vehicle.next_maintenance_date);
      const daysUntilMaintenance = Math.ceil(
        (nextMaintenanceDate.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24),
      );

      let status = 'ok';
      let shouldNotify = false;
      let message = '';

      if (daysUntilMaintenance <= 5 && daysUntilMaintenance > 0) {
        // Critical: 5 days or less
        status = 'critical';
        shouldNotify = true;
        message = `URGENT: ${vehicle.brand} ${vehicle.model} (${vehicle.license_plate}) requires maintenance in ${daysUntilMaintenance} days!`;
      } else if (daysUntilMaintenance <= 60 && daysUntilMaintenance > 5) {
        // Warning: between 6-60 days
        status = 'warning';
        shouldNotify = daysUntilMaintenance === 30; // Notify at 30 days
        message = `${vehicle.brand} ${vehicle.model} (${vehicle.license_plate}) maintenance due in ${daysUntilMaintenance} days`;
      } else if (daysUntilMaintenance <= 0) {
        // Overdue
        status = 'critical';
        shouldNotify = true;
        message = `OVERDUE: ${vehicle.brand} ${vehicle.model} (${vehicle.license_plate}) maintenance is ${Math.abs(daysUntilMaintenance)} days overdue!`;
      }

      // Update vehicle maintenance status
      if (vehicle.maintenance_status !== status) {
        await supabase
          .from('vehicles')
          .update({ maintenance_status: status })
          .eq('id', vehicle.id);

        this.logger.log(
          `Updated ${vehicle.license_plate} status to ${status}`,
        );
      }

      // Send notifications if needed
      if (shouldNotify) {
        // Get all admin and manager users
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'manager'])
          .eq('is_active', true);

        if (users && users.length > 0) {
          for (const user of users) {
            await this.notificationsService.create({
              userId: user.id,
              title: 'Maintenance Alert',
              message: message,
              type: 'service',
            });
          }

          this.logger.log(
            `Sent notifications for ${vehicle.license_plate} to ${users.length} users`,
          );
        }

        // Send SMS for critical alerts
        if (status === 'critical' && vehicle.customers?.phone) {
          const vehicleInfo = `${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`;
          const smsResult = await this.smsService.sendMaintenanceReminder(
            vehicle.customers.phone,
            vehicleInfo,
            daysUntilMaintenance,
          );

          if (smsResult) {
            this.logger.log(
              `SMS sent successfully to ${vehicle.customers.phone} for ${vehicle.license_plate}`,
            );
          } else {
            this.logger.error(
              `Failed to send SMS to ${vehicle.customers.phone} for ${vehicle.license_plate}`,
            );
          }
        }
      }
    }

    this.logger.log('Maintenance check completed');
  }

  // Manual trigger for testing
  async runMaintenanceCheckNow() {
    await this.checkMaintenanceDue();
  }
}
