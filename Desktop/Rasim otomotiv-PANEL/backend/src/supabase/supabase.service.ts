// src/supabase/supabase.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_ANON_KEY');

    if (url && key) {
      this.client = createClient(url, key);
    } else {
      this.logger.warn('Supabase credentials missing in env. Supabase functionality will fail.');
    }
  }

  /**
   * Returns the regular client (anon key) – used for read‑only operations.
   */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY in .env');
    }
    return this.client;
  }

  /**
   * Returns an admin client using the service role key. This client can bypass RLS
   * and is used for privileged actions such as creating users or approving them.
   */
  getAdminClient(): SupabaseClient {
    const url = this.config.get<string>('SUPABASE_URL');
    const serviceKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) {
      this.logger.error('Supabase admin credentials missing');
      throw new Error('Supabase admin configuration not found. Check SUPABASE_SERVICE_ROLE_KEY in .env');
    }
    return createClient(url, serviceKey);
  }
}
