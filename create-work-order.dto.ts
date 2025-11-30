import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  IsDateString,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkOrderPartDto } from './work-order-part.dto';

export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateWorkOrderDto {
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @IsDateString()
  @IsNotEmpty()
  serviceDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkOrderPartDto)
  parts: WorkOrderPartDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(WorkOrderStatus)
  @IsOptional()
  status?: WorkOrderStatus;
}
