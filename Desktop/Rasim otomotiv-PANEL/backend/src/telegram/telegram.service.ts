import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private bot: TelegramBot;
    private chatId: string | undefined;

    constructor(private readonly config: ConfigService) {
        const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
        this.chatId = this.config.get<string>('TELEGRAM_CHAT_ID');

        if (!token || !this.chatId) {
            this.logger.warn('Telegram credentials not set, notifications disabled');
            return;
        }
        this.bot = new TelegramBot(token, { polling: false });
    }

    async sendMessage(message: string) {
        if (!this.bot) {
            this.logger.warn('Telegram bot not initialized');
            return;
        }
        try {
            await this.bot.sendMessage(this.chatId, message);
        } catch (err) {
            this.logger.error('Failed to send telegram message', err);
        }
    }
}
