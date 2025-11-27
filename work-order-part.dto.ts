import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class WorkOrderPartDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsDateString()
  @IsNotEmpty()
  givenDate: string;

  @IsDateString()
  @IsNotEmpty()
  expirationDate: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  profit: number;
}
