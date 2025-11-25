import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private readonly resend: Resend | null;
    private readonly emailEnabled: boolean;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');

        // Email servisini sadece API key varsa aktif et
        if (apiKey && !apiKey.includes('mock')) {
            this.resend = new Resend(apiKey);
            this.emailEnabled = true;
        } else {
            this.resend = null;
            this.emailEnabled = false;
            console.log('📧 Email service disabled (no valid RESEND_API_KEY)');
        }
    }

    async sendUserRegistrationNotification(user: { email: string; firstName: string; lastName: string }) {
        if (!this.emailEnabled || !this.resend) {
            console.log('📧 Email skipped (service disabled):', 'User registration notification');
            return { success: true, skipped: true };
        }

        await this.resend.emails.send({
            from: 'noreply@rasimotomotiv.com',
            to: this.configService.get<string>('ADMIN_EMAIL') || 'admin@rasimotomotiv.com',
            subject: 'Yeni Kullanıcı Kaydı - Onay Bekliyor',
            html: `<h2>Yeni Kullanıcı Kaydı</h2>
        <p><strong>Ad Soyad:</strong> ${user.firstName} ${user.lastName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p>Lütfen Supabase Dashboard üzerinden hesabı onaylayın.</p>`,
        });
        return { success: true };
    }

    async sendWorkOrderNotification(data: { customerName: string; vehicleInfo: string; parts: Array<{ name: string; code: string; price: number; given_date: string }>; serviceDate: string }) {
        if (!this.emailEnabled || !this.resend) {
            console.log('📧 Email skipped (service disabled):', 'Work order notification');
            return { success: true, skipped: true };
        }

        await this.resend.emails.send({
            from: 'noreply@rasimotomotiv.com',
            to: this.configService.get<string>('ADMIN_EMAIL') || 'admin@rasimotomotiv.com',
            subject: 'Yeni İş Emri Oluşturuldu',
            html: `<h2>Yeni İş Emri</h2>
        <p><strong>Müşteri:</strong> ${data.customerName}</p>
        <p><strong>Araç:</strong> ${data.vehicleInfo}</p>
        <p><strong>Servis Tarihi:</strong> ${data.serviceDate}</p>
        <p><strong>Parçalar:</strong></p>
        <ul>${data.parts
                    .map(p => `<li>${p.name} (${p.code}) - ${p.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</li>`)
                    .join('')}</ul>`,
        });
        return { success: true };
    }
}
