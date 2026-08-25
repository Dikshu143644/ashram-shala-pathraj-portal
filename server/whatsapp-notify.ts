/**
 * Central WhatsApp Notification Service
 * Uses Meta WhatsApp Business API for sending messages.
 * Falls back to console logging in dev mode when not configured.
 */

const ADMIN_PHONE = '7666971183';

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !accessToken) {
    console.log(`[WHATSAPP DEV MODE] To: ${phone} | Message: ${message}`);
    return true;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `91${phone}`,
          type: 'text',
          text: { body: message },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`WhatsApp API error (${response.status}):`, errorText.slice(0, 300));
      return false;
    }

    return true;
  } catch (error) {
    console.error('WhatsApp message send failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

export async function sendAdminNotification(message: string): Promise<boolean> {
  return sendWhatsAppMessage(ADMIN_PHONE, message);
}
