import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) { }

  async findById(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('id', id)
      .single();

    // Mock preferences for now until we have a column
    const userWithPrefs = {
      ...user,
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
        },
      },
    };

    return userWithPrefs;
  }

  async findByEmail(email: string) {
    const supabase = this.supabaseService.getClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('email', email)
      .single();

    return user;
  }

  async findAll() {
    const supabase = this.supabaseService.getClient();
    const { data: users } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, created_at')
      .order('created_at', { ascending: false });

    return users;
  }

  async isUserActive(id: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { data: user } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', id)
      .single();

    return user?.is_active || false;
  }
}
