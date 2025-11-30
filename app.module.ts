import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { SalesModule } from './sales/sales.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SupabaseModule } from './supabase/supabase.module';
import { TasksModule } from './tasks/tasks.module';
import { EmailModule } from './email/email.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    VehiclesModule,
    SalesModule,
    NotificationsModule,
    TasksModule,
    EmailModule,
    WorkOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
