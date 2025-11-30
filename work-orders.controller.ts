import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  create(@Body() createWorkOrderDto: CreateWorkOrderDto, @Request() req) {
    return this.workOrdersService.create(createWorkOrderDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.workOrdersService.findAll(req.user.id, req.user.role);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.workOrdersService.getStats(req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.workOrdersService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto,
    @Request() req,
  ) {
    return this.workOrdersService.update(
      id,
      updateWorkOrderDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workOrdersService.remove(id);
  }
}
