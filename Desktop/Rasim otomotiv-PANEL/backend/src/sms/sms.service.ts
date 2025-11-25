import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SMS Service for sending maintenance notifications
 *
 * Integration options:
 * 1. Twilio - https://www.twilio.com/
 * 2. AWS SNS - https://aws.amazon.com/sns/
 * 3. Turkish SMS Providers:
 *    - Netgsm - https://www.netgsm.com.tr/
 *    - İleti Merkezi - https://www.iletimerkezi.com/
 *    - Mutlucell - https://www.mutlucell.com.tr/
 *
 * This is a base implementation. Choose your provider and implement accordingly.
 */

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send SMS using configured provider
   * @param phoneNumber - Recipient phone number in international format (+90...)
   * @param message - SMS message content
   */
  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // TODO: Implement your chosen SMS provider
      // Example with Twilio:
      // const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      // const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
      // const fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');
      // const client = require('twilio')(accountSid, authToken);
      //
      // await client.messages.create({
      //   body: message,
      //   from: fromNumber,
      //   to: phoneNumber
      // });

      // Example with Turkish provider (Netgsm):
      // const username = this.configService.get('NETGSM_USERNAME');
      // const password = this.configService.get('NETGSM_PASSWORD');
      // const header = this.configService.get('NETGSM_HEADER');
      //
      // const url = `https://api.netgsm.com.tr/sms/send/get/?usercode=${username}&password=${password}&gsmno=${phoneNumber}&message=${encodeURIComponent(message)}&msgheader=${header}`;
      // const response = await fetch(url);

      this.logger.log(`SMS would be sent to ${phoneNumber}: ${message}`);

      // For development, we just log the message
      // Remove this return statement when implementing real SMS
      return true;

      // Uncomment when implementing real SMS provider:
      // this.logger.log(`SMS sent successfully to ${phoneNumber}`);
      // return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      return false;
    }
  }

  /**
   * Send maintenance reminder SMS
   */
  async sendMaintenanceReminder(
    phoneNumber: string,
    vehicleInfo: string,
    daysUntil: number,
  ): Promise<boolean> {
    let message: string;

    if (daysUntil <= 0) {
      message = `ACIL: ${vehicleInfo} aracınızın bakım süresi ${Math.abs(daysUntil)} gün önce dolmuştur. Lütfen en kısa sürede servise başvurunuz.`;
    } else if (daysUntil <= 5) {
      message = `UYARI: ${vehicleInfo} aracınızın bakım tarihi ${daysUntil} gün içinde dolacaktır. Randevu almak için lütfen bizimle iletişime geçiniz.`;
    } else {
      message = `${vehicleInfo} aracınızın bakım tarihi ${daysUntil} gün içinde dolacaktır. Bilgilerinize sunulur.`;
    }

    message += ' - Rasim Otomotiv';

    return this.sendSms(phoneNumber, message);
  }

  /**
   * Send sale confirmation SMS
   */
  async sendSaleConfirmation(
    phoneNumber: string,
    customerName: string,
    vehicleInfo: string,
  ): Promise<boolean> {
    const message = `Sayın ${customerName}, ${vehicleInfo} aracınızın satış işlemi tamamlanmıştır. İyi günlerde kullanın. - Rasim Otomotiv`;
    return this.sendSms(phoneNumber, message);
  }

  /**
   * Send custom SMS
   */
  async sendCustomMessage(
    phoneNumber: string,
    message: string,
  ): Promise<boolean> {
    const fullMessage = `${message} - Rasim Otomotiv`;
    return this.sendSms(phoneNumber, fullMessage);
  }
}
