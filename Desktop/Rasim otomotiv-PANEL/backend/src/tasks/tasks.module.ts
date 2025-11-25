import { Module } from '@nestjs/common';
import { MaintenanceTasksService } from './maintenance-tasks.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { SmsModule } from '../sms/sms.module';
import { PartsModule } from '../parts/parts.module';

@Module({
  imports: [NotificationsModule, VehiclesModule, SmsModule, PartsModule],
  providers: [MaintenanceTasksService],
})
export class TasksModule { }
