import { Controller, Get, Param, Patch, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Admin controller for managing users. All routes are assumed to be protected by
 * an admin guard (not shown here). In a real app you would add @UseGuards(AdminGuard).
 */
@Controller('admin/users')
export class AdminUsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly supabaseService: SupabaseService,
    ) { }

    /**
     * Get a list of users pending approval (is_active = false).
     */
    @Get('pending')
    async getPendingUsers() {
        const supabase = this.supabaseService.getAdminClient();
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, role, created_at')
            .eq('is_active', false)
            .order('created_at', { ascending: false });
        if (error) {
            throw new BadRequestException(error.message);
        }
        return users;
    }

    /**
     * Approve a user – set is_active = true.
     */
    @Patch(':id/approve')
    async approveUser(@Param('id') id: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, is_active')
            .eq('id', id)
            .single();
        if (fetchError) {
            throw new NotFoundException('User not found');
        }
        if (user.is_active) {
            throw new BadRequestException('User is already active');
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ is_active: true })
            .eq('id', id);
        if (updateError) {
            throw new BadRequestException(updateError.message);
        }

        // Optionally send a welcome email here using EmailService (omitted for brevity)
        return { message: 'User approved successfully' };
    }
}
