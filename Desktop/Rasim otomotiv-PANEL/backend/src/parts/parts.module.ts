import { Module } from '@nestjs/common';
import { PartsService } from './parts.service';
import { TelegramService } from '../telegram/telegram.service';

@Module({
    providers: [PartsService, TelegramService],
    exports: [PartsService],
})
export class PartsModule { }
