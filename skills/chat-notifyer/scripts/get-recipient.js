#!/usr/bin/env node
/**
 * get-recipient.js — Get a single recipient by phone number.
 *
 * Strategy:
 *   1. Try GET /api:bVXsw_FD/web/recipient?search=<phone>
 *      (returns full record with global_label, note, note_auto, ai_bot_id, etc.)
 *   2. If not found, fallback to GET /api:bVXsw_FD/chatapp/recipient
 *      (returns partial record, but at least confirms the contact exists)
 *
 * Usage:
 *   node scripts/get-recipient.js --phone 14155550123
 *   node scripts/get-recipient.js --phone 14155550123 --pretty
 *
 * Flags:
 *   --phone <number>    Phone number WITHOUT + prefix (integer, e.g. 14155550123)
 *   --pretty            Print human-readable summary to stderr
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": {
 *       "id": 42,
 *       "name": "John Doe",
 *       "phone_number": 14155550123,
 *       "phone_number_string": "+14155550123",
 *       "global_label": ["Support"],
 *       "note": "VIP customer",
 *       "note_auto": "Wants refund for order #123",
 *       "is_ai_assistant": false,
 *       "ai_bot_id": null,
 *       "expiration_timestamp": 1706184000000,
 *       ...
 *     }
 *   }
 *
 * Returns { ok: false, error: "Recipient not found" } if no match.
 *
 * 24h Window: check expiration_timestamp.
 *   - null or past → template-only contact (use send-template.js)
 *   - future → open window (can use send-text.js)
 *
 * Auth: Authorization: <token> (raw JWT, no Bearer — chat auth mode).
 * CORS: /web/recipient requires Origin: https://chat.notifyer-systems.com.
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL    required
 *   NOTIFYER_API_TOKEN       required (from setup-notifyer/login.js)
 *   NOTIFYER_CHAT_ORIGIN     optional (default: https://chat.notifyer-systems.com)
 */

import { loadConfig, requestJson, AUTH_MODE_CHAT } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

const CHAT_ORIGIN = process.env.NOTIFYER_CHAT_ORIGIN ?? "https://chat.notifyer-systems.com";

async function getUserId(config) {
  const result = await requestJson(config, {
    method: "GET",
    path: "/api:-4GSCDHb/auth/me",
  });
  if (!result.ok) return null;
  return result.data?.user_id ?? result.data?.id ?? null;
}

async function findRecipient(config, phone) {
  // Try web/recipient first (has full fields including labels, notes, bot_id)
  const parts = [
    `page_number=0`,
    `per_page=20`,
    `search=${encodeURIComponent(String(phone))}`,
    `labels=[]`,
    `status=`,
  ];
  const webResult = await requestJson(config, {
    method: "GET",
    path: `/api:bVXsw_FD/web/recipient?${parts.join("&")}`,
    extraHeaders: { Origin: CHAT_ORIGIN },
  });
  
  if (webResult.ok) {
    const items = Array.isArray(webResult.data) ? webResult.data : [];
    const match = items.find((row) => {
      const r = (row.recipient && typeof row.recipient === "object") ? row.recipient : row;
      return String(r.phone_number) === String(phone) ||
        String(r.phone_number_string ?? "").replace(/\D/g, "") === String(phone).replace(/\D/g, "");
    });
    if (match) {
      const recipient = (match.recipient && typeof match.recipient === "object") ? match.recipient : match;
      return { ok: true, data: recipient };
    }
  }
  
  // Fallback to chatapp/recipient (partial fields)
  const userId = await getUserId(config);
  if (!userId) {
    return { ok: false, error: `Recipient with phone ${phone} not found.` };
  }
  
  const chatResult = await requestJson(config, {
    method: "GET",
    path: `/api:bVXsw_FD/chatapp/recipient?phone_number=${phone}&user_id=${userId}`,
  });
  
  if (!chatResult.ok) {
    return { ok: false, error: `Recipient with phone ${phone} not found.` };
  }
  
  const data = Array.isArray(chatResult.data) ? chatResult.data[0] : chatResult.data;
  if (!data || (Array.isArray(chatResult.data) && chatResult.data.length === 0)) {
    return { ok: false, error: `Recipient with phone ${phone} not found.` };
  }
  
  return { ok: true, data };
}

async function main() {
  const flags = parseArgs();
  const phoneRaw = getFlag(flags, "phone");
  const pretty = getBooleanFlag(flags, "pretty");

  if (!phoneRaw) {
    printJson(err("--phone is required. Provide the phone number without + prefix (e.g. 14155550123)."));
    return;
  }

  const phone = phoneRaw.replace(/^\+/, "");

  const config = loadConfig({ authMode: AUTH_MODE_CHAT, requireToken: true });

  const findResult = await findRecipient(config, phone);
  if (!findResult.ok) {
    printJson(err(findResult.error));
    return;
  }

  const data = findResult.data;

  if (pretty) {
    const now = Date.now();
    const exp = data.expiration_timestamp;
    
    // Determine if 24-hour window is open
    let windowOpen = false;
    if (exp && exp !== 0 && exp > now) {
      // expiration_timestamp is set and valid
      windowOpen = true;
    } else if (exp === 0 || exp === null) {
      // No expiration_timestamp, fall back to recipient_last_message_time
      const lastMsg = data.recipient_last_message_time;
      if (lastMsg) {
        const hoursSince = (now - lastMsg) / 1000 / 60 / 60;
        windowOpen = hoursSince < 24;
      }
    }
    
    // Parse labels (can be array or JSON string)
    let labels = [];
    if (Array.isArray(data.global_label)) {
      labels = data.global_label;
    } else if (typeof data.global_label === "string" && data.global_label.trim()) {
      try {
        const parsed = JSON.parse(data.global_label);
        labels = Array.isArray(parsed) ? parsed : [];
      } catch {
        labels = [];
      }
    }
    
    process.stderr.write(`\nRecipient: ${data.name ?? "Unknown"}\n`);
    process.stderr.write(`  ID:              ${data.id}\n`);
    process.stderr.write(`  Phone:           ${data.phone_number_string ?? data.phone_number}\n`);
    process.stderr.write(`  Labels:          ${labels.join(", ") || "None"}\n`);
    process.stderr.write(`  Note:            ${data.note || "(none)"}\n`);
    process.stderr.write(`  AI Note:         ${data.note_auto || "(none)"}\n`);
    process.stderr.write(`  AI Assistant:    ${data.is_ai_assistant ? "Yes (Bot)" : "No (Human)"}\n`);
    process.stderr.write(`  AI Bot ID:       ${data.ai_bot_id ?? "None"}\n`);
    process.stderr.write(`  24h Window:      ${windowOpen ? "OPEN (can send text)" : "CLOSED (template only)"}\n`);
    process.stderr.write("\n");
  }

  printJson(ok(data));
}

main().catch((e) => { printJson(err(`Unexpected error: ${e.message}`)); });
