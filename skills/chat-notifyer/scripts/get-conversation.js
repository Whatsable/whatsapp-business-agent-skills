#!/usr/bin/env node
/**
 * get-conversation.js — Fetch the full conversation thread for a recipient.
 *
 * GET /api:bVXsw_FD/web/conversations
 *
 * Returns the full bidirectional message history for a WhatsApp conversation —
 * both messages SENT by your team/agents AND messages RECEIVED from the recipient.
 * This is the same API the chat UI uses to display the conversation thread.
 *
 * Difference from get-conversation-log.js:
 *   - get-conversation.js (this file): /web/conversations — full two-way thread,
 *     both inbound and outbound. Use this for reading/summarising a conversation.
 *   - get-conversation-log.js: /api:ereqLKj6/log — outbound messages only (sent
 *     by your team), console auth. Use this for delivery analytics / send history.
 *
 * Usage:
 *   node scripts/get-conversation.js --phone 14155550123
 *   node scripts/get-conversation.js --phone 14155550123 --page 0 --per-page 50
 *   node scripts/get-conversation.js --phone 14155550123 --pretty
 *
 * Required Flags:
 *   --phone <number>     Recipient phone number WITHOUT + prefix (integer).
 *
 * Optional Flags:
 *   --page <integer>     Page number (0-indexed, default: 0).
 *   --per-page <integer> Messages per page (default: 30, max typically 100).
 *   --pretty             Print a human-readable conversation thread to stderr.
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": {
 *       "phone_number": 14155550123,
 *       "page": 0,
 *       "per_page": 30,
 *       "messages": [
 *         {
 *           "id": 101,
 *           "direction": "inbound",
 *           "type": "text",
 *           "text": "Hello, I need help with my order.",
 *           "timestamp": 1706184000000,
 *           "timestamp_formatted": "2025-01-25T14:00:00.000Z",
 *           "status": "read",
 *           "message_id": "wamid...."
 *         },
 *         {
 *           "id": 102,
 *           "direction": "outbound",
 *           "type": "template",
 *           "template_name": "order_confirmation",
 *           "timestamp": 1706184060000,
 *           "timestamp_formatted": "2025-01-25T14:01:00.000Z",
 *           "status": "delivered"
 *         },
 *         ...
 *       ],
 *       "count": 12
 *     }
 *   }
 *
 * Message fields:
 *   direction     "inbound" (from recipient) | "outbound" (sent by team/agent)
 *   type          "text" | "template" | "image" | "video" | "audio" | "document"
 *   text          Message body for text messages
 *   media_link    URL for media messages (if present)
 *   template_name Name of the WhatsApp template (for template messages)
 *   timestamp     Unix ms timestamp
 *   status        "sent" | "delivered" | "read" | "failed" (outbound); null (inbound)
 *   message_id    WhatsApp message ID (wamid...)
 *
 * Note: messages are ordered chronologically (oldest first).
 *   Use --page to paginate backwards through history.
 *
 * CORS: Xano runs /cors_origin_web_chat on this endpoint.
 *   Script sends Origin: https://chat.notifyer-systems.com.
 *
 * Auth: Authorization: <token> (raw JWT, no Bearer — chat auth mode).
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL    required
 *   NOTIFYER_API_TOKEN       required (from setup-notifyer/login.js)
 *   NOTIFYER_CHAT_ORIGIN     optional (default: https://chat.notifyer-systems.com)
 */

import { loadConfig, requestJson, AUTH_MODE_CHAT } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag, getNumberFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

const CHAT_ORIGIN = process.env.NOTIFYER_CHAT_ORIGIN ?? "https://chat.notifyer-systems.com";

function extractInboundText(msg) {
  // Fast path: recipient field holds the plain text body for inbound text messages.
  if (msg.recipient && typeof msg.recipient === "string" && msg.recipient.trim()) {
    return msg.recipient;
  }
  // Deep path: extract from Meta webhook payload for richer types.
  try {
    const messages = msg.recipient_payload?.entry?.[0]?.changes?.[0]?.value?.messages;
    if (Array.isArray(messages) && messages.length > 0) {
      const m = messages[0];
      if (m.text?.body) return m.text.body;
      if (m.button?.text) return m.button.text;
      if (m.interactive?.button_reply?.title) return m.interactive.button_reply.title;
      if (m.interactive?.list_reply?.title) return m.interactive.list_reply.title;
    }
  } catch (_) {}
  return null;
}

function normaliseMessage(msg) {
  const ts = msg.created_at ?? msg.timestamp ?? null;
  const tsMs = ts ? Number(ts) : null;

  // direction: "webhook" = message came FROM the contact (inbound).
  // All other channels (chat, chat_template, broadcast, zapier_*, chat_schedule, etc.)
  // are messages sent BY the team/automation (outbound).
  const INBOUND_CHANNELS = new Set(["webhook"]);
  const isInbound = INBOUND_CHANNELS.has(msg.channel) || (msg.channel == null && msg.send_by === "" && !msg.system_user);
  const direction = msg.direction ?? (isInbound ? "inbound" : "outbound");

  // For outbound messages the body is in system_user.
  // For inbound messages the body is in recipient or nested in recipient_payload.
  const text = isInbound
    ? extractInboundText(msg)
    : (typeof msg.system_user === "string" && msg.system_user.trim() ? msg.system_user : null);

  const type = msg.type ?? msg.message_type ?? "text";

  // Template name is inside system_user_payload for outbound templates.
  const templateName = msg.template_name
    ?? msg.system_user_payload?.template?.name
    ?? null;

  return {
    id: msg.id,
    direction,
    type,
    text,
    media_link: msg.media_url ?? msg.media_link ?? msg.url ?? null,
    caption: msg.caption ?? null,
    template_name: type === "template" ? templateName : null,
    sent_by: msg.send_by || null,
    timestamp: tsMs,
    timestamp_formatted: tsMs ? new Date(tsMs).toISOString() : null,
    status: msg.status ?? null,
    message_id: msg.message_id ?? msg.wamid ?? null,
  };
}

async function main() {
  const flags = parseArgs();
  const phoneRaw = getFlag(flags, "phone");
  const page = getNumberFlag(flags, "page") ?? 0;
  const perPage = getNumberFlag(flags, "per-page") ?? 30;
  const pretty = getBooleanFlag(flags, "pretty");

  if (!phoneRaw) {
    printJson(err("--phone is required. Provide the recipient phone number without + prefix."));
    return;
  }

  const phone = parseInt(phoneRaw.replace(/^\+/, ""), 10);
  if (isNaN(phone)) {
    printJson(err("--phone must be a valid integer phone number (e.g. 14155550123)."));
    return;
  }

  const config = loadConfig({ authMode: AUTH_MODE_CHAT, requireToken: true });

  const result = await requestJson(config, {
    method: "GET",
    path: "/api:bVXsw_FD/web/conversations",
    query: {
      phone_number: phone,
      page_number: page,
      per_page: perPage,
      offset: page * perPage,
    },
    extraHeaders: { Origin: CHAT_ORIGIN },
  });

  if (!result.ok) {
    printJson(err(result.error, result.data, false, result.status));
    return;
  }

  const rawMessages = Array.isArray(result.data)
    ? result.data
    : (result.data?.items ?? result.data?.messages ?? result.data?.conversation ?? []);

  const messages = rawMessages.map(normaliseMessage);

  if (pretty) {
    process.stderr.write(`\nConversation with +${phone} (page ${page}, ${messages.length} messages)\n`);
    process.stderr.write(`${"─".repeat(80)}\n`);
    for (const msg of messages) {
      const time = msg.timestamp_formatted ? new Date(msg.timestamp_formatted).toLocaleString() : "?";
      const dir = msg.direction === "inbound" ? "←" : "→";
      const who = msg.direction === "inbound" ? "Contact" : (msg.sent_by ?? "Team");
      const content = msg.text?.slice(0, 80)
        ?? (msg.template_name ? `[template: ${msg.template_name}]` : null)
        ?? (msg.media_link ? `[${msg.type}: ${msg.media_link.slice(0, 60)}]` : null)
        ?? `[${msg.type}]`;
      process.stderr.write(`  ${dir} [${time}] (${who}) ${content}\n`);
    }
    process.stderr.write("\n");
  }

  printJson(ok({
    phone_number: phone,
    page,
    per_page: perPage,
    messages,
    count: messages.length,
  }));
}

main().catch((e) => { printJson(err(`Unexpected error: ${e.message}`)); });
