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

    async sendPasswordResetEmail(email: string, token: string) {
        if (!this.emailEnabled || !this.resend) {
            console.log('📧 Email skipped (service disabled):', 'Password reset email');
            return { success: true, skipped: true };
        }

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://panel.otografi.com';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        const htmlTemplate = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Şifre Sıfırlama - Otografi</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;line-height:1.6;color:#333;">
    <div style="background-color:#f5f5f5;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#4ECDC4 0%,#45B8B8 100%);padding:40px 20px;text-align:center;">
                <div style="font-size:28px;font-weight:300;letter-spacing:2px;color:#ffffff;margin-bottom:10px;">
                    OTOGRA<span style="font-weight:700;">FI</span>
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,0.9);letter-spacing:1px;text-transform:uppercase;">
                    Yönetim Paneli
                </div>
            </div>

            <!-- Content -->
            <div style="padding:40px;">
                <div style="font-size:16px;color:#1a1a1a;margin-bottom:24px;font-weight:500;">
                    Merhaba,
                </div>

                <div style="font-size:14px;color:#666;margin-bottom:24px;line-height:1.8;">
                    Otografi yönetim panelinize erişim sağlamak için bir şifre sıfırlama isteği aldık. Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                </div>

                <!-- CTA Button -->
                <div style="text-align:center;margin:36px 0;">
                    <a href="${resetLink}" style="display:inline-block;background-color:#4ECDC4;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:4px;font-size:16px;font-weight:600;letter-spacing:0.5px;">
                        Şifreyi Sıfırla
                    </a>
                </div>

                <div style="text-align:center;font-size:13px;color:#999;margin-top:12px;">
                    veya aşağıdaki bağlantıyı kullanın
                </div>

                <!-- Code Section -->
                <div style="background-color:#f5f5f5;padding:20px;border-radius:4px;text-align:center;margin:24px 0;">
                    <span style="font-size:12px;color:#999;text-transform:uppercase;margin-bottom:8px;display:block;">
                        Sıfırlama Kodu
                    </span>
                    <div style="font-size:24px;font-weight:700;color:#1a1a1a;letter-spacing:2px;font-family:'Courier New',monospace;">
                        ${token.substring(0, 8).toUpperCase()}
                    </div>
                    <div style="font-size:12px;color:#FF6B6B;text-align:center;margin-top:12px;font-weight:500;">
                        ⏱️ Bu kod 1 saat içinde geçersiz olacaktır
                    </div>
                </div>

                <!-- Link Fallback -->
                <div style="font-size:12px;color:#999;text-align:center;margin-top:16px;">
                    Butona tıklayamazsanız, aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:
                </div>
                <div style="font-size:12px;color:#666;word-break:break-all;background-color:#f5f5f5;padding:12px;border-radius:4px;margin:20px 0;">
                    ${resetLink}
                </div>

                <!-- Security Notice -->
                <div style="background-color:#f9f9f9;border-left:4px solid #4ECDC4;padding:16px;margin:24px 0;border-radius:4px;font-size:13px;color:#666;">
                    <strong style="color:#1a1a1a;display:block;margin-bottom:8px;">🔒 Güvenlik Uyarısı</strong>
                    Şifre sıfırlama bağlantınızı başka kimseyle paylaşmayın. Otografi ekibi asla sizden şifrenizi isteyemez.
                </div>

                <div style="font-size:14px;color:#666;margin-bottom:24px;line-height:1.8;">
                    Herhangi bir sorunla karşılaşırsanız veya bu isteği yapmadıysanız, lütfen destek ekibimizle iletişime geçin.
                </div>
            </div>

            <!-- Divider -->
            <div style="padding:0 40px;">
                <div style="height:1px;background-color:#e0e0e0;margin:32px 0;"></div>
            </div>

            <!-- Footer -->
            <div style="background-color:#f5f5f5;padding:24px 40px;border-top:1px solid #e0e0e0;">
                <div style="font-size:13px;color:#999;line-height:1.8;">
                    <p style="margin-bottom:12px;">
                        <strong>Otografi Yönetim Sistemi</strong><br>
                        Profesyonel araç takip ve yönetim platformu
                    </p>
                </div>

                <div style="font-size:12px;color:#999;text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid #e0e0e0;">
                    © 2025 Otografi. Tüm hakları saklıdır.
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

        await this.resend.emails.send({
            from: 'Otografi <noreply@rasimotomotiv.com>',
            to: email,
            subject: 'Şifre Sıfırlama İsteği - Otografi',
            html: htmlTemplate,
        });
        return { success: true };
    }
}
