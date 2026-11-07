import { eq } from "drizzle-orm";
import { db } from "@/db";
import { whatsappNotifications } from "@/db/schema";
import { displayEgyptPhone, normalizeEgyptPhone } from "@/lib/phone";
import { getSetting } from "@/lib/settings";

export type WhatsAppDelivery = {
  notificationId: number;
  confirmToken: string;
  delivered: boolean;
  requiresConfirmation: boolean;
  status: string;
  url: string;
  message: string;
  error?: string;
};

function clip(message: string) {
  if (message.length <= 3500) return message;
  return `${message.slice(0, 3400)}\n\n[Message shortened. The full report remains on the FASLA result page.]`;
}

export async function deliverWhatsApp(input: { kind: string; referenceId: string; message: string }): Promise<WhatsAppDelivery> {
  const recipientDisplay = (await getSetting("whatsapp_number")) || "01201847164";
  const recipient = normalizeEgyptPhone(recipientDisplay) || "201201847164";
  const message = clip(input.message);
  const url = `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
  const [record] = await db
    .insert(whatsappNotifications)
    .values({
      kind: input.kind,
      referenceId: input.referenceId,
      recipient: displayEgyptPhone(recipient),
      message,
      status: "pending",
    })
    .returning();

  if (!record) throw new Error("Could not store WhatsApp notification");

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!token || !phoneId) {
    await db
      .update(whatsappNotifications)
      .set({ status: "awaiting_confirmation", updatedAt: new Date(), error: "WhatsApp Business API is not configured." })
      .where(eq(whatsappNotifications.id, record.id));
    return {
      notificationId: record.id,
      confirmToken: record.confirmToken,
      delivered: false,
      requiresConfirmation: true,
      status: "awaiting_confirmation",
      url,
      message,
    };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { messages?: { id?: string }[]; error?: { message?: string } };
    if (!response.ok) {
      const error = data.error?.message || `WhatsApp API returned ${response.status}`;
      await db
        .update(whatsappNotifications)
        .set({ status: "failed", error, updatedAt: new Date() })
        .where(eq(whatsappNotifications.id, record.id));
      return {
        notificationId: record.id,
        confirmToken: record.confirmToken,
        delivered: false,
        requiresConfirmation: true,
        status: "failed",
        url,
        message,
        error,
      };
    }
    const providerMessageId = data.messages?.[0]?.id ?? null;
    await db
      .update(whatsappNotifications)
      .set({ status: "sent", providerMessageId, error: null, updatedAt: new Date() })
      .where(eq(whatsappNotifications.id, record.id));
    return {
      notificationId: record.id,
      confirmToken: record.confirmToken,
      delivered: true,
      requiresConfirmation: false,
      status: "sent",
      url,
      message,
    };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "WhatsApp request failed";
    await db
      .update(whatsappNotifications)
      .set({ status: "failed", error: messageText, updatedAt: new Date() })
      .where(eq(whatsappNotifications.id, record.id));
    return {
      notificationId: record.id,
      confirmToken: record.confirmToken,
      delivered: false,
      requiresConfirmation: true,
      status: "failed",
      url,
      message,
      error: messageText,
    };
  }
}
