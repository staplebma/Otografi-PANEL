import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @Post()
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: any,
  ) {
    return this.customersService.create(createCustomerDto, user.id);
  }

  @Get('with-vehicles')
  @ApiOperation({ summary: 'Get all customers with their vehicles' })
  @ApiResponse({ status: 200, description: 'Return all customers with vehicles.' })
  async getCustomersWithVehicles(@CurrentUser() user: any) {
    return this.customersService.findAllWithVehicles(user);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: GetCustomersDto) {
    return this.customersService.findAll(user, query);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.customersService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Post('bulk-delete')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete multiple customers' })
  @ApiResponse({ status: 200, description: 'Customers successfully deleted.' })
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.customersService.bulkRemove(body.ids);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
