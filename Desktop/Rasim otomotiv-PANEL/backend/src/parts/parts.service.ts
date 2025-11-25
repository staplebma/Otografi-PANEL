import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TelegramService } from '../telegram/telegram.service';
import { addDays, differenceInDays } from 'date-fns';

/**
 * Service for managing parts lifecycle.
 * Assumes a Supabase table "parts" with columns:
 *   id, name, code, price, given_date (ISO string), lifetime_days (int)
 */
@Injectable()
export class PartsService {
    private readonly logger = new Logger(PartsService.name);

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly telegramService: TelegramService,
    ) { }

    /** Get all parts with computed status */
    async getAllParts() {
        const supabase = this.supabaseService.getClient();
        const { data: parts, error } = await supabase.from('parts').select('*');
        if (error) {
            this.logger.error('Failed to fetch parts', error);
            throw error;
        }
        return parts.map(this.computePartStatus);
    }

    /** Compute status based on remaining days */
    private computePartStatus = (part: any) => {
        const given = new Date(part.given_date);
        const expiration = addDays(given, part.lifetime_days);
        const daysLeft = differenceInDays(expiration, new Date());
        let status: 'active' | 'warning' | 'critical' | 'expired' = 'active';
        if (daysLeft <= 0) status = 'expired';
        else if (daysLeft <= 5) status = 'critical';
        else if (daysLeft <= 60) status = 'warning';
        return { ...part, expirationDate: expiration.toISOString(), daysLeft, status };
    };

    /** Called periodically (e.g., via a scheduled task) to send alerts */
    async sendExpirationAlerts() {
        const parts = await this.getAllParts();
        for (const part of parts) {
            if (part.status === 'warning' || part.status === 'critical') {
                const message = `⚠️ Parça ${part.name} (${part.code}) için kalan süre: ${part.daysLeft} gün. Durum: ${part.status}`;
                await this.telegramService.sendMessage(message);
            }
        }
    }
}
