import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
    CREATED_AT = 'created_at',
    MAINTENANCE_DUE = 'maintenance_due',
    NEWEST_TRANSACTION = 'newest_transaction',
    OLDEST_TRANSACTION = 'oldest_transaction',
    PRICE_ASC = 'price_asc',
    PRICE_DESC = 'price_desc',
}

export class GetCustomersDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy;
}
