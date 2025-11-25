import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
    private emailService: EmailService,
  ) { }

  async register(registerDto: RegisterDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', registerDto.email)
      .single();

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Determine role and active status
    // If role is provided, use it (for admin creation), otherwise default to 'user'
    const role = registerDto.role || 'user';
    // Admin and manager accounts are auto-active, regular users need approval
    const isActive = role === 'admin' || role === 'manager' ? true : false;

    // Create user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: registerDto.email,
        password: hashedPassword,
        first_name: registerDto.firstName,
        last_name: registerDto.lastName,
        role: role,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase registration error:', error);
      throw new ConflictException(error.message || 'Failed to create user');
    }

    // Send email notification to admin only if user needs approval
    if (!isActive) {
      await this.emailService.sendUserRegistrationNotification({
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      });
    }

    // Generate token for auto-active users
    let accessToken: string | null = null;
    if (isActive) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      accessToken = this.jwtService.sign(payload);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      accessToken,
      message: isActive
        ? 'Registration successful. You can now login.'
        : 'Registration successful. Please wait for admin approval.',
    };
  }

  async login(loginDto: LoginDto) {
    const supabase = this.supabaseService.getClient();

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', loginDto.email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      access_token: accessToken, // Underscore for consistency
      accessToken, // Also keep camelCase for compatibility
    };
  }

  async validateUser(userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('id', userId)
      .single();

    return user;
  }

  async forgotPassword(email: string) {
    // Mock password reset
    console.log(`[MOCK EMAIL] Password reset requested for: ${email}`);
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async updateProfile(userId: string, updateData: { firstName?: string; lastName?: string }) {
    const supabase = this.supabaseService.getAdminClient();

    const updatePayload: any = {};
    if (updateData.firstName !== undefined) {
      updatePayload.first_name = updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      updatePayload.last_name = updateData.lastName;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('id, email, first_name, last_name, role')
      .single();

    if (error) {
      throw new BadRequestException(error.message || 'Failed to update profile');
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
    };
  }
}
