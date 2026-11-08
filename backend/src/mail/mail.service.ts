import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Order } from '../order/entities/order.entity.js'; 

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;'); // Corrigido o escape do caractere '

const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend?: Resend;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY não encontrada. Os e-mails serão apenas logados no console.');
    }
  }

  async sendOrderConfirmation(order: Order): Promise<void> {
    const rows = order.items.map((i) => {
      const sessionDetails = i.session_starts_at
        ? `<br><small>${escapeHtml(i.session_starts_at.toLocaleString('pt-BR'))} · ${i.quantity} participante(s) · ${escapeHtml(i.session_location ?? '')}</small>`
        : '';
      return `<tr><td>${escapeHtml(i.product_name)}${sessionDetails}</td><td>${i.quantity}</td><td>${brl(i.subtotal_cents)}</td></tr>`;
    }).join('');

    const from = this.config.get<string>('MAIL_FROM') ?? 'Loja <onboarding@resend.dev>';
    const to = order.customer_email;
    const subject = `Pedido ${order.id} confirmado`;
    const html = `
      <h2>Obrigado pela compra, ${escapeHtml(order.customer_name)}!</h2>
      <p>Pedido: <strong>${order.id}</strong></p>
      <table cellpadding="6" border="1" style="border-collapse:collapse">
        <tr><th>Produto</th><th>Qtd</th><th>Subtotal</th></tr>
        ${rows}
      </table>
      <p><strong>Total: ${brl(order.total_cents)}</strong></p>`;

    // Se o Resend estiver configurado, faz o envio real
    if (this.resend) {
      const { data, error } = await this.resend.emails.send({
        from,
        to: [to],
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Falha ao enviar e-mail via Resend: ${error.message}`);
        return;
      }

      this.logger.log(`E-mail do pedido ${order.id} enviado com sucesso! ID: ${data?.id}`);
    } else {
      this.logger.log('--- MODO SIMULAÇÃO DE E-MAIL (Sem API Key) ---');
      this.logger.log(`De: ${from}`);
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Assunto: ${subject}`);
      this.logger.log(`Conteúdo HTML:\n${html}`);
      this.logger.log('--------------------------------------------');
    }
  }
}
