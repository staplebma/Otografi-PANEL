import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/status')
  async getUserStatus(@Param('id') id: string) {
    const isActive = await this.usersService.isUserActive(id);
    return { isActive };
  }
}
